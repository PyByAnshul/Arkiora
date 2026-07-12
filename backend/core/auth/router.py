"""Auth endpoints: login, refresh (rotation), logout, current user (FR-AUTH-01..08).

Fixes applied:
- /refresh and /logout now accept RefreshIn (only refresh_token) not TokenOut (FR-AUTH-03/04)
- /login has per-IP + per-email brute-force lockout after 5 failures (FR-AUTH-05)
"""
from __future__ import annotations

import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_session
from core.security.jwt import create_access_token, create_refresh_token, decode_token
from core.security.password import hash_password, verify_password
from infrastructure.orm.core_models import Session, User

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Brute-force protection (FR-AUTH-05): in-process sliding window.
# Swap for Redis in multi-pod deployments.
# ---------------------------------------------------------------------------
_MAX_ATTEMPTS = 5
_WINDOW_SECONDS = 300  # 5-minute window
_login_hits: defaultdict[str, deque] = defaultdict(deque)  # key -> deque of timestamps


def _is_locked(key: str) -> bool:
    """Return True if `key` has >= _MAX_ATTEMPTS failures in the last _WINDOW_SECONDS."""
    now = time.monotonic()
    window = _login_hits[key]
    while window and now - window[0] > _WINDOW_SECONDS:
        window.popleft()
    return len(window) >= _MAX_ATTEMPTS


def _record_failure(key: str) -> None:
    _login_hits[key].append(time.monotonic())


def _clear_failures(key: str) -> None:
    _login_hits[key].clear()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    first_name: str | None = None
    last_name: str | None = None


class RegisterOut(BaseModel):
    id: str
    email: str
    first_name: str | None
    last_name: str | None


class LoginIn(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str


class RefreshIn(BaseModel):
    """Only the refresh token is needed — the access token is not accepted as input."""
    refresh_token: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now() -> datetime:
    return datetime.now(timezone.utc)


def _exp_from_token(token: str) -> datetime:
    claims = decode_token(token)
    return datetime.fromtimestamp(claims["exp"], tz=timezone.utc)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/register", response_model=RegisterOut, status_code=201)
async def register(
    payload: RegisterIn,
    session: AsyncSession = Depends(get_session),
):
    """Create a new user account (FR-AUTH-00). Email must be unique."""
    # Check for existing user — constant-time-ish: we query before hashing.
    existing = (
        await session.execute(select(User).where(User.email == payload.email))
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="An account with that email already exists.")

    # Password length guard (min 8 chars).
    if len(payload.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        is_active=True,
        is_superadmin=False,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return RegisterOut(
        id=str(user.id),
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
    )


@router.post("/login", response_model=TokenOut)
async def login(
    payload: LoginIn,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    ip = request.client.host if request.client else "unknown"
    email_key = f"email:{payload.email}"
    ip_key = f"ip:{ip}"

    # FR-AUTH-05: check lockout before touching the DB (saves a query on locked IPs).
    if _is_locked(ip_key) or _is_locked(email_key):
        raise HTTPException(
            status_code=429,
            detail="Too many failed attempts. Please wait 5 minutes before trying again.",
        )

    user = (
        await session.execute(select(User).where(User.email == payload.email))
    ).scalar_one_or_none()

    # Constant-time path: always check password even if user not found to prevent user enumeration.
    valid = (
        user is not None
        and user.deleted_at is None
        and user.is_active
        and verify_password(payload.password, user.hashed_password)
    )
    if not valid:
        _record_failure(ip_key)
        _record_failure(email_key)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Successful login — clear failure counters.
    _clear_failures(ip_key)
    _clear_failures(email_key)

    refresh = create_refresh_token(str(user.id))
    session.add(
        Session(
            user_id=user.id,
            refresh_token=refresh,
            ip_address=ip,
            user_agent=request.headers.get("user-agent"),
            expires_at=_exp_from_token(refresh),
        )
    )
    await session.commit()
    return TokenOut(
        access_token=create_access_token(str(user.id)),
        refresh_token=refresh,
    )


@router.post("/refresh", response_model=TokenOut)
async def refresh(
    payload: RefreshIn,  # Fixed: was TokenOut (had access_token field too)
    session: AsyncSession = Depends(get_session),
):
    """Rotate refresh token. Old token is revoked; new token + new access token returned."""
    try:
        claims = decode_token(payload.refresh_token)
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if claims.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Not a refresh token")

    stored = (
        await session.execute(
            select(Session).where(
                Session.refresh_token == payload.refresh_token,
                Session.revoked_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    if stored is None:
        raise HTTPException(status_code=401, detail="Refresh token revoked or unknown")

    # Rotate: revoke old, issue new.
    stored.revoked_at = _now()
    new_refresh = create_refresh_token(claims["sub"])
    session.add(
        Session(
            user_id=uuid.UUID(claims["sub"]),
            refresh_token=new_refresh,
            expires_at=_exp_from_token(new_refresh),
        )
    )
    await session.commit()
    return TokenOut(
        access_token=create_access_token(claims["sub"]),
        refresh_token=new_refresh,
    )


@router.post("/logout")
async def logout(
    payload: RefreshIn,  # Fixed: was TokenOut (had access_token field too)
    session: AsyncSession = Depends(get_session),
):
    """Revoke the supplied refresh token. Idempotent — always returns success."""
    stored = (
        await session.execute(
            select(Session).where(Session.refresh_token == payload.refresh_token)
        )
    ).scalar_one_or_none()
    if stored and stored.revoked_at is None:
        stored.revoked_at = _now()
        await session.commit()
    return {"success": True}


@router.get("/me")
async def me(request: Request, session: AsyncSession = Depends(get_session)):
    """Return current user profile from a valid access token."""
    auth = request.headers.get("Authorization", "")
    token = auth.split(" ", 1)[1] if auth.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        claims = decode_token(token)
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=401, detail="Invalid token")
    if claims.get("type") != "access":
        raise HTTPException(status_code=401, detail="Not an access token")
    user = (
        await session.execute(
            select(User).where(User.id == uuid.UUID(claims["sub"]), User.deleted_at.is_(None))
        )
    ).scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return {
        "id": str(user.id),
        "email": user.email,
        "is_superadmin": user.is_superadmin,
        "company_id": str(user.company_id) if user.company_id else None,
    }
