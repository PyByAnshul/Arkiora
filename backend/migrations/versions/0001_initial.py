"""Initial schema — all core framework + AssetFlow tables (design.md §4).

Revision ID: 0001_initial
Revises:
Create Date: 2026-07-12

Note: this bootstrap migration builds the full schema from the ORM metadata.
Subsequent migrations must be explicit (op.create_table / op.alter_table) and
never call Base.metadata.create_all() (agent.md §8).
"""
from __future__ import annotations

from alembic import op
from sqlalchemy import create_engine

from core.config import get_settings
from shared.base_orm_model import Base

# Ensure every ORM model is imported so its table is on Base.metadata.
import infrastructure.orm.core_models  # noqa: F401
import modules.asset_management.infrastructure.orm.asset_model  # noqa: F401

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    sync_url = get_settings().database_url.replace("+asyncpg", "+psycopg")
    engine = create_engine(sync_url, future=True)
    Base.metadata.create_all(engine)
    engine.dispose()


def downgrade() -> None:
    sync_url = get_settings().database_url.replace("+asyncpg", "+psycopg")
    engine = create_engine(sync_url, future=True)
    Base.metadata.drop_all(engine)
    engine.dispose()
