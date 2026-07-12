"""Model Registry — maps model name -> service class (design.md §6)."""
from __future__ import annotations

from core.exceptions import ModelNotFoundError


class ModelRegistry:
    """Central map of model_name -> application service class."""

    _registry: dict[str, type] = {}

    @classmethod
    def register(cls, model_name: str, service_class: type) -> None:
        cls._registry[model_name] = service_class

    @classmethod
    def get(cls, model_name: str) -> type:
        if model_name not in cls._registry:
            raise ModelNotFoundError(model_name)
        return cls._registry[model_name]

    @classmethod
    def all(cls) -> dict[str, type]:
        return dict(cls._registry)
