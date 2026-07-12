"""AssetFlow application services: Asset, AssetCategory, Allocation (agent.md §4)."""
from __future__ import annotations

import uuid

from core.crud.base_repository import BaseRepository
from core.exceptions import ValidationError
from core.permissions.record_rules import record_rule_domain
from core.permissions.service import RequestContext, apply_field_permissions

from modules.asset_management.application.dtos.asset_dto import AllocateSchema
from modules.asset_management.application.services.base_service import BaseService, _jsonable
from modules.asset_management.infrastructure.orm.asset_model import (
    Allocation,
    Asset,
    AssetCategory,
)
from modules.asset_management.domain.entities.asset import Asset as AssetEntity


class AssetService(BaseService):
    model_name = "asset"
    orm_model = Asset

    def __init__(self, session, ctx: RequestContext) -> None:
        super().__init__(session, ctx)
        self.allocation_repo = BaseRepository(session, Allocation)

    async def allocate(self, **kwargs):
        """Custom method `asset.allocate` (FR-AL-01..04)."""
        params = AllocateSchema(**kwargs)
        # FR-AL-04: one active allocation per asset at a time.
        # Pass UUID object directly — the column is UUID type; str coercion works on
        # PostgreSQL but is inconsistent and can break on other DBs or with strict typing.
        active, _ = await self.allocation_repo.search(
            domain=[
                ["asset_id", "=", params.asset_id],
                ["status", "in", ["requested", "approved", "allocated"]],
            ],
            page_size=1,
        )
        if active:
            raise ValidationError("Asset already has an active allocation")
        alloc = await self.allocation_repo.create(
            {
                "company_id": self.ctx.company_id,
                "asset_id": params.asset_id,
                "allocated_to": params.allocated_to,
                "department_id": params.department_id,
                "status": "requested",
                "notes": params.notes,
                "created_by": self.ctx.user_id,
            }
        )
        return self._to_dict(alloc)

    async def change_status(self, ids, **kwargs):
        """Validate a workflow transition before writing status (FR-AM-02)."""
        to_status = kwargs.get("status")
        if not to_status:
            raise ValidationError("status is required")
        rows = await self.repo.read(ids)
        if not rows:
            from core.exceptions import NotFoundError

            raise NotFoundError("Asset not found")
        for row in rows:
            entity = AssetEntity(status=row.status)
            entity.transition(to_status)  # raises WorkflowError if illegal
        await self.repo.write(ids, {"status": to_status})
        return {"updated": list(ids), "status": to_status}


class AssetCategoryService(BaseService):
    model_name = "asset.category"
    orm_model = AssetCategory


class AllocationService(BaseService):
    model_name = "asset.allocation"
    orm_model = Allocation
