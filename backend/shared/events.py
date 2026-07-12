"""Domain event base class (design.md: services publish domain events)."""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class DomainEvent:
    """Base domain event. Concrete events carry their own payload fields."""

    event_id: uuid.UUID = field(default_factory=uuid.uuid4)
    occurred_at: datetime = field(default_factory=datetime.now)
