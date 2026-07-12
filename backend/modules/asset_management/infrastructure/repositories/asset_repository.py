"""Concrete repositories implementing the domain interfaces (agent.md §7)."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from core.crud.base_repository import BaseRepository
from modules.asset_management.domain.repositories.i_repositories import (
    IAllocationRepository,
    IAssetCategoryRepository,
    IAssetRepository,
)
from modules.asset_management.infrastructure.orm.asset_model import (
    Allocation,
    Asset,
    AssetCategory,
)


class AssetRepository(BaseRepository, IAssetRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Asset)


class AssetCategoryRepository(BaseRepository, IAssetCategoryRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, AssetCategory)


class AllocationRepository(BaseRepository, IAllocationRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Allocation)
