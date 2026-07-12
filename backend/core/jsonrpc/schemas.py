"""JSON-RPC 2.0 request/response models (design.md §5)."""
from __future__ import annotations

from pydantic import BaseModel, Field


class JsonRpcRequest(BaseModel):
    jsonrpc: str = Field(default="2.0")
    id: str | int | None = None
    method: str
    params: dict | None = None


class JsonRpcError(BaseModel):
    code: int
    message: str
    data: object | None = None


class JsonRpcResponse(BaseModel):
    jsonrpc: str = "2.0"
    id: str | int | None = None
    result: object | None = None
    error: JsonRpcError | None = None
