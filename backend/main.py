"""FastAPI app factory — wires routers, registers modules, exposes health + metadata."""
from __future__ import annotations

import uuid
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth.router import router as auth_router
from core.config import get_settings
from core.database import get_session
from core.jsonrpc.router import router as jsonrpc_router
from core.security.jwt import decode_token
from modules.asset_management import register as register_assetflow
from modules.asset_management.presentation.metadata import (
    asset_form_metadata,
    asset_table_metadata,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Module manifests register their models/methods on startup only (fix: no bare
    # register() call in __init__.py any more — agent.md §13).
    register_assetflow()
    yield


# ---------------------------------------------------------------------------
# Auth dependency for protected non-RPC endpoints
# ---------------------------------------------------------------------------

async def _require_auth(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Validates Bearer token and returns JWT claims. Raises 401 on failure."""
    auth = request.headers.get("Authorization", "")
    token = auth.split(" ", 1)[1] if auth.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        claims = decode_token(token)
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if claims.get("type") != "access":
        raise HTTPException(status_code=401, detail="Not an access token")
    return claims


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

    # Fix: CORSMiddleware wired (NFR-SEC-04, security checklist in agent.md §11).
    # Configure APP_CORS_ORIGINS in env for production (e.g. "https://app.example.com").
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(jsonrpc_router)
    app.include_router(auth_router)

    @app.get("/health/live")
    def health_live() -> dict:
        return {"status": "ok"}

    @app.get("/health/ready")
    def health_ready() -> dict:
        return {"status": "ok"}

    # Fix: /api/metadata now requires a valid access token (agent.md security checklist).
    @app.get("/api/metadata")
    async def metadata(
        model: str = Query("asset"),
        _claims: dict = Depends(_require_auth),
    ) -> dict:
        if model == "asset":
            return {"form": asset_form_metadata(), "table": asset_table_metadata()}
        return {"form": {}, "table": {}}

    return app


app = create_app()
