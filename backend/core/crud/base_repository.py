"""Generic async repository — soft-delete aware CRUD (agent.md §7, FR-CRUD-01..07)."""
from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from core.crud.query_builder import apply_filters, apply_sorting, count_statement


class BaseRepository:
    """Works on any ORM model. Subclass per-entity repos or use directly."""

    def __init__(self, session: AsyncSession, model: type) -> None:
        self.session = session
        self.model = model

    async def create(self, data: dict) -> object:
        obj = self.model(**data)
        self.session.add(obj)
        await self.session.flush()
        return obj

    async def read(self, ids: Sequence, include_deleted: bool = False) -> list:
        stmt = select(self.model).where(self.model.id.in_(list(ids)))
        if not include_deleted:
            stmt = stmt.where(self.model.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search(
        self,
        domain: Sequence | None = None,
        sort_by: str | None = None,
        sort_order: str = "asc",
        page: int = 1,
        page_size: int = 50,
        include_deleted: bool = False,
    ) -> tuple[list, int]:
        base = select(self.model)
        if not include_deleted:
            base = base.where(self.model.deleted_at.is_(None))
        base = apply_filters(base, self.model, domain or [])
        base = apply_sorting(base, self.model, sort_by, sort_order)
        total = await self._count(domain or [], include_deleted)
        stmt = base.limit(page_size).offset((page - 1) * page_size)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def count(self, domain: Sequence | None = None, include_deleted: bool = False) -> int:
        return await self._count(domain or [], include_deleted)

    async def _count(self, domain: Sequence, include_deleted: bool) -> int:
        stmt = count_statement(self.model, domain)
        if not include_deleted:
            stmt = stmt.where(self.model.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return int(result.scalar_one())

    async def write(self, ids: Sequence, values: dict) -> None:
        if not ids:
            return
        # Explicitly inject updated_at because bulk UPDATE via execute() bypasses
        # SQLAlchemy's onupdate hook (FR-CRUD-01, agent.md §8 DB rules).
        from datetime import datetime, timezone
        values = {**values, "updated_at": datetime.now(timezone.utc)}
        stmt = update(self.model).where(self.model.id.in_(list(ids))).values(**values)
        await self.session.execute(stmt)
        await self.session.flush()

    async def unlink(self, ids: Sequence) -> None:
        """Soft delete only (agent.md rule 9)."""
        if not ids:
            return
        stmt = update(self.model).where(self.model.id.in_(list(ids))).values(
            deleted_at=func.now()
        )
        await self.session.execute(stmt)
        await self.session.flush()
