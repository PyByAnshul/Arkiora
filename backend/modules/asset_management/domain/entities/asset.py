"""Asset domain entity — pure Python, no ORM (agent.md §4)."""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field

from shared.base_entity import BaseEntity


# FR-AM-02: draft → active → under_maintenance → disposed / written_off
ALLOWED_TRANSITIONS: dict[str, list[str]] = {
    "draft": ["active"],
    "active": ["under_maintenance", "disposed", "written_off"],
    "under_maintenance": ["active", "disposed", "written_off"],
    "disposed": [],
    "written_off": [],
}


@dataclass
class Asset(BaseEntity):
    company_id: uuid.UUID | None = None
    category_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    code: str = ""
    name: str = ""
    serial_number: str | None = None
    description: str | None = None
    location: str | None = None
    status: str = "draft"
    purchase_price: float | None = None
    current_value: float | None = None
    version: int = 1

    def can_transition(self, to_status: str) -> bool:
        return to_status in ALLOWED_TRANSITIONS.get(self.status, [])

    def transition(self, to_status: str) -> None:
        if not self.can_transition(to_status):
            from core.exceptions import WorkflowError

            raise WorkflowError(f"Cannot move asset from '{self.status}' to '{to_status}'")
        self.status = to_status
