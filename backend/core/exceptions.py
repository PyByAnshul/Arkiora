"""Custom exception hierarchy. All errors map to JSON-RPC error codes (design.md §5.3)."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ErrorSpec:
    code: int
    message: str
    http_status: int = 400


class AppError(Exception):
    """Base class for all application errors."""

    code: int = -32603
    message: str = "Internal error"
    http_status: int = 500

    def to_error_spec(self) -> ErrorSpec:
        return ErrorSpec(code=self.code, message=self.message, http_status=self.http_status)


class ParseError(AppError):
    code, message, http_status = -32700, "Parse error", 400


class InvalidRequestError(AppError):
    code, message, http_status = -32600, "Invalid request", 400


class MethodNotFoundError(AppError):
    code, message, http_status = -32601, "Method not found", 404


class InvalidParamsError(AppError):
    code, message, http_status = -32602, "Invalid params", 422


class InternalError(AppError):
    code, message, http_status = -32603, "Internal error", 500


class UnauthorizedError(AppError):
    code, message, http_status = -32001, "Unauthorized", 401


class ForbiddenError(AppError):
    code, message, http_status = -32002, "Forbidden", 403


class NotFoundError(AppError):
    code, message, http_status = -32003, "Record not found", 404


class ValidationError(AppError):
    code, message, http_status = -32004, "Validation error", 422


class WorkflowError(AppError):
    code, message, http_status = -32005, "Workflow transition error", 422


class ModelNotFoundError(InvalidRequestError):
    def __init__(self, model: str) -> None:
        self.message = f"Model '{model}' is not registered"


class MethodNotFoundError2(MethodNotFoundError):
    def __init__(self, model: str, method: str) -> None:
        self.message = f"Method '{method}' not found on model '{model}'"
