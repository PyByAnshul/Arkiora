"""FastAPI route for POST /api/jsonrpc (design.md §5)."""
from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from core.database import get_session
from core.jsonrpc.dispatcher import Dispatcher
from core.logging import new_request_id

router = APIRouter(prefix="/api/jsonrpc", tags=["jsonrpc"])

# ponytail: in-process sliding-window limiter. Swap for Redis in multi-pod (NFR-SEC-06).
_hits: defaultdict[str, deque] = defaultdict(deque)


def _rate_limited(ip: str) -> bool:
    cfg = get_settings()
    now = time.monotonic()
    window = _hits[ip]
    while window and now - window[0] > 60:
        window.popleft()
    if len(window) >= cfg.rate_limit_per_minute:
        return True
    window.append(now)
    return False


@router.post("")
async def jsonrpc_endpoint(
    request: Request,
    raw: dict,
    session: AsyncSession = Depends(get_session),
):
    ip = request.client.host if request.client else "unknown"
    if _rate_limited(ip):
        from fastapi import HTTPException

        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    dispatcher = Dispatcher(session=session, request_id=new_request_id())
    return await dispatcher.handle(raw, request.headers.get("Authorization"))
