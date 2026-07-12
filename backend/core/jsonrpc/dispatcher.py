"""JSON-RPC 2.0 dispatcher — the request lifecycle (design.md §5.2)."""
from __future__ import annotations

import uuid

from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from core.audit.service import write_audit
from core.exceptions import (
    AppError,
    ForbiddenError,
    InvalidRequestError,
    MethodNotFoundError2,
    UnauthorizedError,
)
from core.jsonrpc.schemas import JsonRpcError, JsonRpcRequest, JsonRpcResponse
from core.permissions.service import RequestContext, check_model_permission, load_context
from core.registry.method_registry import MethodRegistry
from core.registry.model_registry import ModelRegistry
from core.security.jwt import decode_token

# Generic CRUD method -> required permission action.
_ACTION_BY_METHOD = {
    "search": "read",
    "read": "read",
    "count": "read",
    "create": "create",
    "write": "update",
    "unlink": "delete",
}
_MUTATING = {"create", "write", "unlink"}


def _extract_token(auth_header: str | None) -> str | None:
    if not auth_header:
        return None
    parts = auth_header.split(" ", 1)
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def _error(code: int, message: str, request_id) -> dict:
    return JsonRpcResponse(
        id=request_id, error=JsonRpcError(code=code, message=message)
    ).model_dump(exclude_none=True)


class Dispatcher:
    def __init__(self, session: AsyncSession, request_id: str = "") -> None:
        self.session = session
        self.request_id = request_id

    async def handle(self, raw: dict, auth_header: str | None) -> dict:
        try:
            return await self._handle(raw, auth_header)
        except AppError as exc:
            spec = exc.to_error_spec()
            return _error(spec.code, spec.message, raw.get("id") if isinstance(raw, dict) else None)
        except JWTError:
            return _error(-32001, "Unauthorized: invalid or expired token", raw.get("id"))
        except Exception as exc:  # noqa: BLE001 — never leak internals to the client
            from core.logging import get_logger

            get_logger("jsonrpc").error("dispatch failure", extra={"exc": str(exc)})
            return _error(-32603, "Internal error", raw.get("id") if isinstance(raw, dict) else None)

    async def _handle(self, raw: dict, auth_header: str | None) -> dict:
        if not isinstance(raw, dict):
            raise InvalidRequestError("Request must be a JSON object")
        req = JsonRpcRequest(**raw)
        if req.jsonrpc != "2.0" or req.method != "call":
            raise InvalidRequestError("Only JSON-RPC 2.0 'call' is supported")
        params = req.params or {}
        model = params.get("model")
        method = params.get("method")
        if not model or not method:
            raise InvalidRequestError("params.model and params.method are required")

        # 1-2. JWT → user → security context
        token = _extract_token(auth_header)
        if not token:
            raise UnauthorizedError("Missing bearer token")
        claims = decode_token(token)
        if claims.get("type") != "access":
            raise UnauthorizedError("Not an access token")
        ctx = await load_context(self.session, uuid.UUID(claims["sub"]))
        ctx.request_id = self.request_id

        # 3. Resolve model → service
        service_cls = ModelRegistry.get(model)
        service = service_cls(session=self.session, ctx=ctx)

        # 4. Permission check (model-level or method-level)
        if method in _ACTION_BY_METHOD:
            check_model_permission(ctx, model, _ACTION_BY_METHOD[method])
            kwargs = params.get("kwargs") or {}
        else:
            descriptor = MethodRegistry.try_get(model, method)
            if descriptor is None or not hasattr(service, method):
                raise MethodNotFoundError2(model, method)
            for perm in descriptor.permissions:
                m, _, a = perm.partition(":")
                check_model_permission(ctx, m, a)
            kwargs = params.get("kwargs") or {}
            if descriptor.schema is not None:
                validated = descriptor.schema(**kwargs)
                kwargs = validated.model_dump()

        # 5. Execute
        result = await getattr(service, method)(**kwargs)

        # 6. Audit (best-effort, non-blocking for the response)
        if method in _MUTATING or method not in _ACTION_BY_METHOD:
            record_id = None
            if isinstance(result, dict) and "id" in result:
                record_id = result["id"]
            await write_audit(
                self.session, ctx, model=model, record_id=record_id, action=method
            )
        await self.session.commit()
        return JsonRpcResponse(id=req.id, result=result).model_dump(exclude_none=True)
