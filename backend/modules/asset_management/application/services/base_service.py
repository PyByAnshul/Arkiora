"""Base application service: generic CRUD wired through repository + permissions."""
from __future__ import annotations

from core.crud.base_repository import BaseRepository
from core.permissions.record_rules import record_rule_domain
from core.permissions.service import RequestContext, apply_field_permissions


def _jsonable(value):
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if hasattr(value, "__str__") and type(value).__name__ == "UUID":
        return str(value)
    return value


class BaseService:
    """Subclasses set `model_name` and `orm_model`."""

    model_name: str = ""
    orm_model = None

    def __init__(self, session, ctx: RequestContext) -> None:
        self.session = session
        self.ctx = ctx
        self.repo = BaseRepository(session, self.orm_model)

    def _to_dict(self, obj) -> dict:
        data = {c.name: _jsonable(getattr(obj, c.name)) for c in obj.__table__.columns}
        return apply_field_permissions(self.ctx, self.model_name, data, "read")

    async def search(self, domain=None, sort_by=None, sort_order="asc", page=1, page_size=50):
        domain = list(domain or []) + record_rule_domain(self.ctx, self.model_name)
        rows, total = await self.repo.search(domain, sort_by, sort_order, page, page_size)
        return [self._to_dict(r) for r in rows], total

    async def read(self, ids):
        rows = await self.repo.read(ids)
        return [self._to_dict(r) for r in rows]

    async def count(self, domain=None):
        domain = list(domain or []) + record_rule_domain(self.ctx, self.model_name)
        return await self.repo.count(domain)

    async def create(self, **kwargs):
        kwargs = apply_field_permissions(self.ctx, self.model_name, kwargs, "write")
        obj = await self.repo.create(kwargs)
        return self._to_dict(obj)

    async def write(self, ids, **kwargs):
        kwargs = apply_field_permissions(self.ctx, self.model_name, kwargs, "write")
        await self.repo.write(ids, kwargs)
        return {"updated": list(ids) if not isinstance(ids, str) else [ids]}

    async def unlink(self, ids):
        await self.repo.unlink(ids)
        return {"deleted": True}
