"""DTOs / validation schemas for the AssetFlow module (agent.md §4: typed, never plain dict)."""
from __future__ import annotations

import uuid
from datetime import date

from pydantic import BaseModel, Field


class AssetCreateSchema(BaseModel):
    name: str = Field(min_length=1)
    code: str = Field(min_length=1)
    category_id: uuid.UUID
    company_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    serial_number: str | None = None
    description: str | None = None
    location: str | None = None
    purchase_date: date | None = None
    purchase_price: float | None = None
    current_value: float | None = None


class AllocateSchema(BaseModel):
    """Input schema for the custom `asset.allocate` method (FR-AL-01)."""

    asset_id: uuid.UUID
    allocated_to: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    notes: str | None = None
