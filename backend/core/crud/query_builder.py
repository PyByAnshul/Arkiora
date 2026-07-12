"""Translates generic filter/sort params into SQLAlchemy (design.md FR-CRUD-03/04)."""
from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import Select, func, select
from sqlalchemy.sql import ColumnElement

# operator -> predicate builder over a column and a value
_OPERATORS: dict[str, object] = {
    "=": lambda c, v: c == v,
    "!=": lambda c, v: c != v,
    ">": lambda c, v: c > v,
    "<": lambda c, v: c < v,
    ">=": lambda c, v: c >= v,
    "<=": lambda c, v: c <= v,
    "like": lambda c, v: c.like(v),
    "ilike": lambda c, v: c.ilike(v),
    "in": lambda c, v: c.in_(v if isinstance(v, (list, tuple, set)) else [v]),
    "not in": lambda c, v: c.notin_(v if isinstance(v, (list, tuple, set)) else [v]),
    "is null": lambda c, v: c.is_(None),
    "is not null": lambda c, v: c.isnot(None),
}


def apply_filters(stmt: Select, model: type, domain: Sequence[Sequence]) -> Select:
    """domain is a list of [field, operator, value] triples (Odoo-style)."""
    for rule in domain:
        field, op, value = rule[0], rule[1], rule[2]
        column = getattr(model, field)
        builder = _OPERATORS.get(op)
        if builder is None:
            raise ValueError(f"Unsupported operator: {op}")
        stmt = stmt.where(builder(column, value))
    return stmt


def apply_sorting(stmt: Select, model: type, sort_by: str | None, sort_order: str) -> Select:
    if not sort_by or not hasattr(model, sort_by):
        return stmt
    column: ColumnElement = getattr(model, sort_by)
    return stmt.order_by(column.desc() if sort_order == "desc" else column.asc())


def count_statement(model: type, domain: Sequence[Sequence]) -> Select:
    stmt = select(func.count()).select_from(model)
    return apply_filters(stmt, model, domain)
