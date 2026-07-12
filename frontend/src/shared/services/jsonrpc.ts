import { apiFetch, ApiError } from "./api";

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}
export interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: T;
  error?: JsonRpcError;
}

/** Generic JSON-RPC 2.0 caller matching the backend dispatcher (design.md §5). */
export async function jsonrpc<T = unknown>(
  model: string,
  method: string,
  kwargs: Record<string, unknown> = {},
  id = "1"
): Promise<T> {
  const body = { jsonrpc: "2.0", id, method: "call", params: { model, method, kwargs } };
  const res = await apiFetch<JsonRpcResponse<T>>("/api/jsonrpc", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (res.error) throw new ApiError(`[${res.error.code}] ${res.error.message}`, 400, res.error);
  return res.result as T;
}

export type DomainOp = "=" | "!=" | ">" | "<" | ">=" | "<=" | "like" | "ilike" | "in" | "not in" | "is null" | "is not null";
export type Domain = [string, DomainOp, unknown][];

export interface SearchOptions {
  domain?: Domain;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export interface SearchResult<T> {
  rows: T[];
  total: number;
}

/** `search` returns a `[rows, total]` tuple — unwrap it into a friendly shape. */
export async function jsonrpcSearch<T = Record<string, unknown>>(
  model: string,
  opts: SearchOptions = {}
): Promise<SearchResult<T>> {
  const result = await jsonrpc<[T[], number]>(model, "search", opts as Record<string, unknown>);
  const [rows, total] = result ?? [[], 0];
  return { rows, total };
}

export const recordApi = {
  create: (model: string, values: Record<string, unknown>) => jsonrpc(model, "create", values),
  read: (model: string, ids: string[]) => jsonrpc<Record<string, unknown>[]>(model, "read", { ids }),
  write: (model: string, ids: string[], values: Record<string, unknown>) =>
    jsonrpc(model, "write", { ids, ...values }),
  unlink: (model: string, ids: string[]) => jsonrpc(model, "unlink", { ids }),
  count: (model: string, domain?: Domain) => jsonrpc<number>(model, "count", { domain: domain ?? [] }),
};
