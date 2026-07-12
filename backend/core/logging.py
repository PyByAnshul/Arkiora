"""Structured JSON logger (agent.md rule 13: never print(), use structured logger)."""
from __future__ import annotations

import json
import logging
import sys
import uuid
from datetime import datetime, timezone

from core.config import get_settings

_CONFIGURED = False


def _json_formatter(record: logging.LogRecord) -> str:
    payload = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "level": record.levelname,
        "logger": record.name,
        "msg": record.getMessage(),
        "request_id": getattr(record, "request_id", None),
    }
    if record.exc_info:
        payload["exc"] = logging.Formatter().formatException(record.exc_info)
    return json.dumps(payload, default=str)


def get_logger(name: str = "assetflow") -> logging.Logger:
    """Return a JSON-emitting logger. Safe fields only — no secrets."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter("%(message)s"))
        handler.emit = lambda r: print(_json_formatter(r), file=sys.stdout, flush=True)  # type: ignore[method-assign]
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG if get_settings().debug else logging.INFO)
        logger.propagate = False
    return logger


def new_request_id() -> str:
    return uuid.uuid4().hex
