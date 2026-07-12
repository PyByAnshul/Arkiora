"""RBAC: load user context, check model + field permissions (design.md §7, FR-AUTHZ-01..07)."""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import ForbiddenError, UnauthorizedError
from infrastructure.orm.core_models import (
    FieldPermission,
    Permission,
    RecordRule,
    RolePermission,
    User,
    UserRole,
)


@dataclass
class RequestContext:
    """Per-request security context, built once from the JWT + DB."""

    user_id: uuid.UUID
    company_id: uuid.UUID | None
    is_superadmin: bool
    permissions: set[str] = field(default_factory=set)  # {"asset:create", ...} or {"*"}
    field_perms: dict[str, dict[str, dict[str, bool]]] = field(default_factory=dict)
    record_rules: dict[str, list] = field(default_factory=dict)
    request_id: str = ""


async def load_context(session: AsyncSession, user_id: uuid.UUID) -> RequestContext:
    """Build a RequestContext by joining user → roles → permissions from the DB."""
    user = (
        await session.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if user is None or not user.is_active:
        raise UnauthorizedError("User is inactive or missing")

    ctx = RequestContext(
        user_id=user.id,
        company_id=user.company_id,
        is_superadmin=bool(user.is_superadmin),
    )
    if ctx.is_superadmin:
        ctx.permissions = {"*"}
        return ctx

    role_ids = list(
        (
            await session.execute(select(UserRole.role_id).where(UserRole.user_id == user_id))
        ).scalars().all()
    )
    if role_ids:
        perm_rows = (
            await session.execute(
                select(Permission.model, Permission.action)
                .join(RolePermission, RolePermission.permission_id == Permission.id)
                .where(RolePermission.role_id.in_(role_ids))
            )
        ).all()
        ctx.permissions = {f"{m}:{a}" for m, a in perm_rows}

        fp_rows = (
            await session.execute(
                select(FieldPermission).where(FieldPermission.role_id.in_(role_ids))
            )
        ).scalars().all()
        for fp in fp_rows:
            ctx.field_perms.setdefault(fp.model, {})[fp.field_name] = {
                "read": fp.can_read,
                "write": fp.can_write,
            }

        rr_rows = (
            await session.execute(
                select(RecordRule).where(
                    RecordRule.role_id.in_(role_ids), RecordRule.is_active.is_(True)
                )
            )
        ).scalars().all()
        for rr in rr_rows:
            ctx.record_rules.setdefault(rr.model, []).append(rr.domain)

    return ctx


def check_model_permission(ctx: RequestContext, model: str, action: str) -> None:
    """Raise ForbiddenError unless the context may perform `model:action`."""
    if ctx.is_superadmin or "*" in ctx.permissions:
        return
    if f"{model}:{action}" in ctx.permissions:
        return
    raise ForbiddenError(f"Missing permission: {model}:{action}")


def apply_field_permissions(
    ctx: RequestContext, model: str, data: dict, mode: str
) -> dict:
    """Drop fields the context may not `read`/`write` on `model` (FR-AUTHZ-03)."""
    field_map = ctx.field_perms.get(model)
    if not field_map:
        return data
    allowed_key = "read" if mode == "read" else "write"
    return {
        k: v
        for k, v in data.items()
        if field_map.get(k, {}).get(allowed_key, True)
    }
