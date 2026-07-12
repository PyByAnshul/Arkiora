"""Application settings — environment-driven only, never hardcoded (agent.md rule 5)."""
from __future__ import annotations

import base64
from functools import lru_cache

from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")

    app_name: str = "AssetFlow ERP"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/assetflow"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT (RS256). If keys are not provided via env, ephemeral dev keys are generated
    # at startup. Production must set APP_JWT_PRIVATE_KEY / APP_JWT_PUBLIC_KEY (PEM).
    jwt_private_key: str | None = None
    jwt_public_key: str | None = None
    jwt_algorithm: str = "RS256"
    access_token_ttl_minutes: int = 15
    refresh_token_ttl_days: int = 7

    # Security
    argon2_time_cost: int = 3
    argon2_memory_cost: int = 65536
    argon2_parallelism: int = 4

    # Rate limiting
    rate_limit_per_minute: int = 100

    # CORS
    cors_origins: list[str] = ["*"]


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton (ponytail: one instance, no global mutable state)."""
    return Settings()


def _ensure_jwt_keys(settings: Settings) -> tuple[str, str]:
    """Return (private_pem, public_pem). Generate ephemeral dev keys if unset."""
    if settings.jwt_private_key and settings.jwt_public_key:
        return settings.jwt_private_key, settings.jwt_public_key
    # ponytail: dev-only fallback so the app runs without provisioned keys.
    # Real deployments must inject keys via APP_JWT_PRIVATE_KEY / APP_JWT_PUBLIC_KEY.
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    priv = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()
    pub = key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()
    return priv, pub


# Expose a module-level keypair resolved once at import for convenience.
_settings = get_settings()
JWT_PRIVATE_KEY, JWT_PUBLIC_KEY = _ensure_jwt_keys(_settings)
