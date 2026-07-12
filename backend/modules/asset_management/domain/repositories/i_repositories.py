"""Repository interfaces — defined in the domain layer (agent.md rule 7)."""
from __future__ import annotations

from abc import ABC, abstractmethod


class IRepository(ABC):
    """Generic async CRUD contract every repository implements."""

    @abstractmethod
    async def create(self, data: dict) -> object: ...

    @abstractmethod
    async def read(self, ids, include_deleted: bool = False) -> list: ...

    @abstractmethod
    async def search(self, domain=None, sort_by=None, sort_order="asc",
                     page=1, page_size=50, include_deleted=False) -> tuple[list, int]: ...

    @abstractmethod
    async def count(self, domain=None, include_deleted=False) -> int: ...

    @abstractmethod
    async def write(self, ids, values: dict) -> None: ...

    @abstractmethod
    async def unlink(self, ids) -> None: ...


class IAssetRepository(IRepository):
    pass


class IAssetCategoryRepository(IRepository):
    pass


class IAllocationRepository(IRepository):
    pass
