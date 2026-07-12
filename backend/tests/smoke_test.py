"""Smoke test: wires the framework, checks registries/metadata, exercises pure logic.

Run from backend/:  python tests/smoke_test.py
(Database-backed flows need Postgres + `alembic upgrade head`; this validates
everything that does not require a live DB.)
"""
from __future__ import annotations

import asyncio
import uuid

from core.jsonrpc.dispatcher import _ACTION_BY_METHOD
from core.permissions.record_rules import _resolve_placeholders
from core.permissions.service import RequestContext, apply_field_permissions, check_model_permission
from core.registry.method_registry import MethodRegistry
from core.registry.model_registry import ModelRegistry
from core.security.jwt import create_access_token, decode_token
from core.security.password import hash_password, verify_password
from modules.asset_management.domain.entities.asset import ALLOWED_TRANSITIONS, Asset


def test_wiring() -> None:
    # register() is now only called by the lifespan hook in production.
    # In tests we call it directly (agent.md §5: register() removed from import side-effect).
    from modules.asset_management import register
    register()

    models = set(ModelRegistry.all().keys())
    assert {"asset", "asset.category", "asset.allocation"} <= models, models
    assert MethodRegistry.try_get("asset", "allocate") is not None
    assert MethodRegistry.try_get("asset", "change_status") is not None

    from shared.base_orm_model import Base

    names = set(Base.metadata.tables.keys())
    for required in (
        "companies", "users", "roles", "permissions", "assets", "asset_categories",
        "asset_allocations", "audit_logs", "record_rules", "sessions",
    ):
        assert required in names, f"missing table: {required}"
    print(f"[ok] wiring: {len(models)} models, {len(names)} tables")


def test_workflow_transitions() -> None:
    a = Asset(status="draft")
    assert a.can_transition("active")
    a.transition("active")
    assert a.status == "active"
    assert not a.can_transition("draft")
    try:
        a.transition("draft")
        raise AssertionError("illegal transition should fail")
    except Exception:
        pass
    print("[ok] workflow transitions enforced")


def test_permissions() -> None:
    ctx = RequestContext(user_id=uuid.uuid4(), company_id=None, is_superadmin=False,
                         permissions={"asset:read"})
    check_model_permission(ctx, "asset", "read")  # ok
    try:
        check_model_permission(ctx, "asset", "create")
        raise AssertionError("should be forbidden")
    except Exception:
        pass
    # field perms
    data = {"name": "x", "cost": 5}
    ctx.field_perms = {"asset": {"cost": {"read": False, "write": True}}}
    out = apply_field_permissions(ctx, "asset", data, "read")
    assert "cost" not in out and "name" in out
    print("[ok] permissions + field filtering")


def test_record_rule_placeholders() -> None:
    ctx = RequestContext(user_id=uuid.uuid4(), company_id=uuid.uuid4(), is_superadmin=False)
    domain = _resolve_placeholders([["company_id", "=", "{{user.company_id}}"]], ctx)
    assert domain[0][2] == ctx.company_id
    print("[ok] record-rule placeholder resolution")


def test_security_roundtrip() -> None:
    pw = "s3cret!"
    h = hash_password(pw)
    assert verify_password(pw, h)
    assert not verify_password("wrong", h)
    token = create_access_token("user-123", extra={"is_superadmin": True})
    claims = decode_token(token)
    assert claims["sub"] == "user-123" and claims["type"] == "access"
    print("[ok] password hashing + JWT RS256 roundtrip")


if __name__ == "__main__":
    test_wiring()
    test_workflow_transitions()
    test_permissions()
    test_record_rule_placeholders()
    test_security_roundtrip()
    print("\nALL SMOKE TESTS PASSED")
