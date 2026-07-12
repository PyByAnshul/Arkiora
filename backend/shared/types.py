"""Shared custom types and value objects (design.md: Money, common UUID helpers)."""
from __future__ import annotations

import uuid
from dataclasses import dataclass


@dataclass(frozen=True)
class Money:
    """Immutable money value (design.md lists Money as a custom type)."""

    amount: float
    currency: str = "USD"

    def __post_init__(self) -> None:
        if self.amount < 0:
            raise ValueError("Money amount cannot be negative")


def new_uuid() -> uuid.UUID:
    return uuid.uuid4()
