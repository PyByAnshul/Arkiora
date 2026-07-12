"""End-to-end demo against a running server: login -> create category -> create asset -> search.

Run after `uvicorn main:app`:  PYTHONPATH=. python scripts/e2e_demo.py
"""
from __future__ import annotations

import json
import urllib.request

BASE = "http://localhost:8000"


def _post(path: str, payload: dict, token: str | None = None) -> dict:
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(
        BASE + path, data=json.dumps(payload).encode(), headers=headers, method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode()
        raise SystemExit(f"HTTP {exc.code} on {path}: {body}") from None


def rpc(model: str, method: str, kwargs: dict, token: str) -> dict:
    body = {
        "jsonrpc": "2.0",
        "id": "1",
        "method": "call",
        "params": {"model": model, "method": method, "kwargs": kwargs},
    }
    out = _post("/api/jsonrpc", body, token)
    assert "error" not in out, f"RPC error: {out.get('error')}"
    return out["result"]


def main() -> None:
    # 1. Login as superadmin
    login = _post(
        "/api/auth/login",
        {"email": "admin@assetflow.local", "password": "admin123"},
    )
    token = login["access_token"]
    me_req = urllib.request.Request(BASE + "/api/auth/me", headers={"Authorization": f"Bearer {token}"}, method="GET")
    with urllib.request.urlopen(me_req) as resp:
        me = json.load(resp)
    company_id = me["company_id"]
    print(f"[ok] login as {me['email']} (company={company_id})")

    # 2. Create an asset category
    cat = rpc(
        "asset.category",
        "create",
        {"name": "Laptops", "code": "LAP", "company_id": company_id,
         "depreciation_method": "straight_line", "useful_life_years": 4,
         "salvage_value": 5000},
        token,
    )
    print(f"[ok] created category code={cat['code']} id={cat['id']}")

    # 3. Create an asset
    asset = rpc(
        "asset",
        "create",
        {"name": "Dell XPS 15", "code": "AST-0001", "category_id": cat["id"],
         "company_id": company_id, "purchase_price": 185000,
         "current_value": 185000, "status": "draft"},
        token,
    )
    print(f"[ok] created asset code={asset['code']} id={asset['id']} status={asset['status']}")

    # 4. Advance workflow: draft -> active
    moved = rpc("asset", "change_status", {"ids": [asset["id"]], "status": "active"}, token)
    print(f"[ok] workflow {moved}")

    # 5. Search
    rows, total = rpc("asset", "search", {"page_size": 10}, token)
    print(f"[ok] search returned {total} asset(s); first code={rows[0]['code']}")

    # 6. Metadata endpoint (UI contract) — GET
    headers = {"Authorization": f"Bearer {token}"}
    req = urllib.request.Request(BASE + "/api/metadata?model=asset", headers=headers, method="GET")
    with urllib.request.urlopen(req) as resp:
        meta = json.load(resp)
    print(f"[ok] metadata fields={len(meta['form']['fields'])} columns={len(meta['table']['columns'])}")

    print("\nE2E OK — backend serves auth + JSON-RPC CRUD + workflow + metadata")


if __name__ == "__main__":
    main()
