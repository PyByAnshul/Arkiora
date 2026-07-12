"""JWT creation/verification — RS256 asymmetric keys (NFR-SEC-02)."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from core.config import JWT_PRIVATE_KEY, JWT_PUBLIC_KEY, get_settings

_settings = get_settings()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(subject: str, *, extra: dict | None = None) -> str:
    """Short-lived access token (default 15 min)."""
    payload = {
        "sub": subject,
        "type": "access",
        "iat": _now(),
        "exp": _now() + timedelta(minutes=_settings.access_token_ttl_minutes),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, JWT_PRIVATE_KEY, algorithm=_settings.jwt_algorithm)


def create_refresh_token(subject: str) -> str:
    """Long-lived refresh token (default 7 days) with a random jti for rotation."""
    import uuid

    payload = {
        "sub": subject,
        "type": "refresh",
        "jti": uuid.uuid4().hex,
        "iat": _now(),
        "exp": _now() + timedelta(days=_settings.refresh_token_ttl_days),
    }
    return jwt.encode(payload, JWT_PRIVATE_KEY, algorithm=_settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    """Decode and verify a token. Raises JWTError on invalid/expired."""
    return jwt.decode(token, JWT_PUBLIC_KEY, algorithms=[_settings.jwt_algorithm])
