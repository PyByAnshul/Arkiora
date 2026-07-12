"use client";

import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "./ui/Button";
import { StatusBadge } from "./ui/StatusBadge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Record_ } from "@/lib/types";
import type { ColumnMeta, ModuleMeta } from "@/lib/modules";

interface Props {
  module: ModuleMeta;
  rows: Record_[];
  total: number;
  loading?: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  sort?: { field: string; order: "asc" | "desc" };
  onSort?: (field: string) => void;
  search: string;
  onSearch: (value: string) => void;
  onNew: () => void;
  onRowClick?: (row: Record_) => void;
  onAction?: (action: string, row: Record_) => void;
}

function renderCell(col: ColumnMeta, value: unknown) {
  if (col.type === "status") return <StatusBadge status={String(value ?? "")} />;
  if (col.type === "currency") return <span className="tabular-nums">{formatCurrency(value)}</span>;
  if (col.type === "date") return <span>{formatDate(value)}</span>;
  if (value === null || value === undefined || value === "") return <span className="text-outline-strong">—</span>;
  return <span className="truncate">{String(value)}</span>;
}

export function GenericTable({
  module,
  rows,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  sort,
  onSort,
  search,
  onSearch,
  onNew,
  onRowClick,
  onAction,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const Icon = module.icon;

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-outline px-5 py-4">
        <div className="flex items-center gap-2 text-title-sm font-semibold">
          <Icon size={18} className="text-primary" />
          {module.label}
        </div>
        <div className="relative ml-auto w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-strong" />
          <input
            className="input-base pl-9"
            placeholder={`Search ${module.label.toLowerCase()}…`}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        {module.enabled && (
          <Button onClick={onNew} size="sm">
            <Plus size={16} /> New
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-outline bg-surface-container-low text-left">
              {module.columns.map((col) => (
                <th
                  key={col.field}
                  className="px-5 py-3 text-label-md font-medium uppercase tracking-wide text-on-surface-variant"
                >
                  {col.sortable ? (
                    <button className="inline-flex items-center gap-1 hover:text-primary" onClick={() => onSort?.(col.field)}>
                      {col.header}
                      <span className={cn(sort?.field === col.field ? "text-primary" : "text-outline-strong")}>
                        {sort?.field === col.field ? (sort.order === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {module.rowActions.length > 0 && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={module.columns.length + 1} className="px-5 py-10 text-center text-on-surface-variant">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={module.columns.length + 1} className="px-5 py-10 text-center text-on-surface-variant">
                  No {module.label.toLowerCase()} found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={String(row.id)}
                  className={cn("border-b border-outline/60 hover:bg-surface-container-low", onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(row)}
                >
                  {module.columns.map((col) => (
                    <td key={col.field} className="px-5 py-3 text-on-surface">
                      {renderCell(col, row[col.field])}
                    </td>
                  ))}
                  {module.rowActions.length > 0 && (
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {module.rowActions.includes("view") && (
                          <button className="rounded p-1.5 text-on-surface-variant hover:bg-surface-container" title="View" onClick={() => onAction?.("view", row)}>
                            <Eye size={16} />
                          </button>
                        )}
                        {module.rowActions.includes("edit") && (
                          <button className="rounded p-1.5 text-on-surface-variant hover:bg-surface-container" title="Edit" onClick={() => onAction?.("edit", row)}>
                            <Pencil size={16} />
                          </button>
                        )}
                        {module.rowActions.includes("delete") && (
                          <button className="rounded p-1.5 text-error hover:bg-error-container" title="Delete" onClick={() => onAction?.("delete", row)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-outline px-5 py-3 text-body-sm text-on-surface-variant">
        <span>
          {total} record{total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
            <ChevronLeft size={16} /> Prev
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
