"""Argon2id password hashing (NFR-SEC-01).

Cost parameters are driven by settings (argon2_time_cost, argon2_memory_cost,
argon2_parallelism) so they can be tuned per deployment without code changes.
"""
from __future__ import annotations

from functools import lru_cache

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError


@lru_cache(maxsize=1)
def _get_hasher() -> PasswordHasher:
    """Build PasswordHasher once from settings — avoids circular import at module level."""
    from core.config import get_settings

    s = get_settings()
    return PasswordHasher(
        time_cost=s.argon2_time_cost,
        memory_cost=s.argon2_memory_cost,
        parallelism=s.argon2_parallelism,
    )


def hash_password(plain: str) -> str:
    return _get_hasher().hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _get_hasher().verify(hashed, plain)
    except VerifyMismatchError:
        return False
    except Exception:
        # Malformed hash or other failure — treat as invalid, never raise at auth boundary.
        return False
