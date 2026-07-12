"use client";

import { useQuery } from "@tanstack/react-query";
import { Boxes } from "lucide-react";
import { jsonrpcSearch, recordApi } from "@/shared/services/jsonrpc";
import { StatusBadge } from "@/shared/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import type { Record_ } from "@/lib/types";

async function counts() {
  const [total, active, maint, disposed] = await Promise.all([
    recordApi.count("asset"),
    recordApi.count("asset", [["status", "=", "active"]]),
    recordApi.count("asset", [["status", "=", "under_maintenance"]]),
    recordApi.count("asset", [["status", "=", "disposed"]]),
  ]);
  return { total, active, maint, disposed };
}

export default function DashboardHome() {
  const stats = useQuery({ queryKey: ["dashboard-counts"], queryFn: counts });
  const recent = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: () => jsonrpcSearch<Record_>("asset", { page_size: 6, sort_by: "created_at", sort_order: "desc" }),
  });

  const cards = [
    { label: "Total Assets", value: stats.data?.total, icon: Boxes, tone: "text-primary bg-primary/10" },
    { label: "Active", value: stats.data?.active, icon: Boxes, tone: "text-success bg-success-container" },
    { label: "Under Maintenance", value: stats.data?.maint, icon: Boxes, tone: "text-warning bg-warning-container" },
    { label: "Disposed", value: stats.data?.disposed, icon: Boxes, tone: "text-error bg-error-container" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${c.tone}`}>
                <Icon size={22} />
              </div>
              <div>
                <div className="text-label-md text-on-surface-variant">{c.label}</div>
                <div className="text-headline-md font-semibold text-on-surface">
                  {stats.isLoading ? "…" : (c.value ?? 0)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-outline px-5 py-4 text-title-sm font-semibold">Recent Assets</div>
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-outline bg-surface-container-low text-left text-label-md uppercase text-on-surface-variant">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Value</th>
              </tr>
            </thead>
            <tbody>
              {recent.isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-on-surface-variant">
                    Loading…
                  </td>
                </tr>
              ) : recent.data?.rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-on-surface-variant">
                    No assets yet.
                  </td>
                </tr>
              ) : (
                recent.data?.rows.map((a) => (
                  <tr key={String(a.id)} className="border-b border-outline/60">
                    <td className="px-5 py-3">{String(a.code ?? "—")}</td>
                    <td className="px-5 py-3">{String(a.name ?? "—")}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={String(a.status ?? "")} />
                    </td>
                    <td className="px-5 py-3 tabular-nums">{formatCurrency(a.current_value)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
