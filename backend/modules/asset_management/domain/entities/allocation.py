"""Allocation domain entity (FR-AL-01..05)."""
from __future__ import annotations

import uuid
from dataclasses import dataclass

from shared.base_entity import BaseEntity


# FR-AL-02: requested → approved → allocated → returned
ALLOCATION_TRANSITIONS: dict[str, list[str]] = {
    "requested": ["approved", "returned"],
    "approved": ["allocated", "returned"],
    "allocated": ["returned"],
    "returned": [],
}


@dataclass
class Allocation(BaseEntity):
    company_id: uuid.UUID | None = None
    asset_id: uuid.UUID | None = None
    allocated_to: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    status: str = "requested"
    notes: str | None = None

    def can_transition(self, to_status: str) -> bool:
        return to_status in ALLOCATION_TRANSITIONS.get(self.status, [])
