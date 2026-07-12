"""AssetFlow module manifest — registers models + methods (design.md §6, §12).

The `register()` function is called once from main.py's lifespan hook.
It is NOT called at import time to avoid side effects on bare imports and
to prevent double-registration (agent.md §13: no bare register() at module level).
"""
from __future__ import annotations

from core.registry.method_registry import MethodRegistry
from core.registry.model_registry import ModelRegistry

from modules.asset_management.application.dtos.asset_dto import AllocateSchema
from modules.asset_management.application.services.asset_service import (
    AllocationService,
    AssetCategoryService,
    AssetService,
)


def register() -> None:
    """Wire AssetFlow into the framework. Called once at app startup."""
    ModelRegistry.register("asset", AssetService)
    ModelRegistry.register("asset.category", AssetCategoryService)
    ModelRegistry.register("asset.allocation", AllocationService)

    MethodRegistry.register(
        "asset", "allocate", schema=AllocateSchema, permissions=["asset.allocate"]
    )
    MethodRegistry.register("asset", "change_status", permissions=["asset.update"])
