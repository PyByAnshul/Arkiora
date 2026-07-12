"""AssetCategory domain entity (hierarchical, carries depreciation config)."""
from __future__ import annotations

import uuid
from dataclasses import dataclass

from shared.base_entity import BaseEntity


@dataclass
class AssetCategory(BaseEntity):
    company_id: uuid.UUID | None = None
    parent_id: uuid.UUID | None = None
    name: str = ""
    code: str | None = None
    depreciation_method: str | None = None
    useful_life_years: int | None = None
    salvage_value: float | None = None
