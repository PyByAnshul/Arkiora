"""Async SQLAlchemy engine + session factory (agent.md rule 4: async only)."""
from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from core.config import get_settings
from shared.base_orm_model import Base


_engine = create_async_engine(
    get_settings().database_url,
    echo=get_settings().debug,
    pool_pre_ping=True,
    future=True,
)

SessionFactory = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an async session."""
    async with SessionFactory() as session:
        yield session


async def init_models() -> None:
    """Create tables from metadata. Dev/tests only — production uses Alembic (agent.md §8)."""
    # Import all ORM modules so their tables register on Base.metadata before create_all.
    import shared.base_orm_model  # noqa: F401  (keeps Base referenced)
    from infrastructure.orm import asset_model  # noqa: F401
    from infrastructure.orm import core_models  # noqa: F401

    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
