"""Seed an initial company + superadmin so the system is usable after migrations.

Run after `alembic upgrade head`:
    APP_DATABASE_URL=... python scripts/seed.py
"""
from __future__ import annotations

import asyncio

from sqlalchemy import select

from core.database import SessionFactory
from core.security.password import hash_password
from infrastructure.orm.core_models import Company, User


async def main() -> None:
    async with SessionFactory() as session:
        existing = (
            await session.execute(select(User).where(User.is_superadmin.is_(True)))
        ).scalar_one_or_none()
        if existing:
            print(f"Superadmin already exists: {existing.email}")
            return
        company = Company(name="Default Company", code="default")
        session.add(company)
        await session.flush()
        admin = User(
            company_id=company.id,
            email="admin@assetflow.local",
            hashed_password=hash_password("admin123"),
            is_superadmin=True,
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        print(f"Seeded company={company.id} superadmin={admin.email} (password: admin123)")


if __name__ == "__main__":
    asyncio.run(main())
