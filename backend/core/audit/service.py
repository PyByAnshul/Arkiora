"""Audit log writer (FR-AUDIT-01..04). Immutable rows, written per mutation."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from core.permissions.service import RequestContext
from infrastructure.orm.core_models import AuditLog


async def write_audit(
    session: AsyncSession,
    ctx: RequestContext,
    *,
    model: str,
    record_id: uuid.UUID | None,
    action: str,
    old_values: dict | None = None,
    new_values: dict | None = None,
    ip_address: str | None = None,
) -> None:
    """Append an audit entry. Best-effort; failures are swallowed by the caller."""
    entry = AuditLog(
        company_id=ctx.company_id,
        user_id=ctx.user_id,
        model=model,
        record_id=record_id or uuid.uuid4(),
        action=action,
        old_values=old_values,
        new_values=new_values,
        ip_address=ip_address,
        request_id=ctx.request_id or None,
    )
    session.add(entry)
    await session.flush()
