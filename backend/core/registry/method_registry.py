"""Method Registry — carries permission + schema metadata for custom methods (design.md §6)."""
from __future__ import annotations

from dataclasses import dataclass, field

from core.exceptions import MethodNotFoundError2


@dataclass
class MethodDescriptor:
    """Metadata for a (model, method). `handler` is optional; when omitted the
    dispatcher calls `getattr(service, method)` directly."""

    handler: object | None = None
    schema: type | None = None
    permissions: list[str] = field(default_factory=list)


class MethodRegistry:
    """Central map of (model, method) -> descriptor."""

    _registry: dict[tuple[str, str], MethodDescriptor] = {}

    @classmethod
    def register(
        cls,
        model: str,
        method: str,
        handler: object | None = None,
        schema: type | None = None,
        permissions: list[str] | None = None,
    ) -> None:
        cls._registry[(model, method)] = MethodDescriptor(
            handler=handler, schema=schema, permissions=permissions or []
        )

    @classmethod
    def get(cls, model: str, method: str) -> MethodDescriptor:
        key = (model, method)
        if key not in cls._registry:
            raise MethodNotFoundError2(model, method)
        return cls._registry[key]

    @classmethod
    def try_get(cls, model: str, method: str) -> MethodDescriptor | None:
        return cls._registry.get((model, method))
