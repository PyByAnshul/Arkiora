"""Base domain entity — plain Python, no ORM (agent.md §4: entities are not ORM models)."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone


def _utcnow() -> datetime:
    """Always return a timezone-aware UTC datetime (NFR-SEC, agent.md §8)."""
    return datetime.now(timezone.utc)


class BaseEntity:
    """Identity + audit timestamps for domain entities. Subclassed, not instantiated."""

    def __init__(
        self,
        id: uuid.UUID | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        deleted_at: datetime | None = None,
    ) -> None:
        self.id = id or uuid.uuid4()
        self.created_at = created_at or _utcnow()
        self.updated_at = updated_at or _utcnow()
        self.deleted_at = deleted_at

    def __eq__(self, other: object) -> bool:
        return isinstance(other, BaseEntity) and self.id == other.id

    def __hash__(self) -> int:
        return hash(self.id)
