"""Record Rules — dynamic row-level filters per user/role (FR-AUTHZ-04)."""
from __future__ import annotations

from core.permissions.service import RequestContext
from core.crud.query_builder import apply_filters
from sqlalchemy import Select


def _resolve_placeholders(domain: list, ctx: RequestContext) -> list:
    """Replace {{user.company_id}} style tokens with context values."""
    resolved: list = []
    for field, op, value in domain:
        if isinstance(value, str) and value.startswith("{{") and value.endswith("}}"):
            token = value[2:-2].strip()
            if token == "user.company_id":
                value = ctx.company_id
        resolved.append([field, op, value])
    return resolved


def record_rule_domain(ctx: RequestContext, model: str) -> list:
    """Merged record-rule domain for `model` (multiple rules ANDed)."""
    domains = ctx.record_rules.get(model, [])
    merged: list = []
    for domain in domains:
        merged.extend(_resolve_placeholders(domain, ctx))
    return merged


def apply_record_rules(stmt: Select, model: type, ctx: RequestContext, model_name: str) -> Select:
    """Inject record-rule filters into a SELECT statement."""
    domain = record_rule_domain(ctx, model_name)
    if domain:
        stmt = apply_filters(stmt, model, domain)
    # ponytail: company isolation is enforced via record rules, not a hard query hook.
    return stmt
