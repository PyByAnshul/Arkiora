"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Boxes, Activity, Wrench, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const tableVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

// Stitch-style skeleton: shimmer inside white rounded-2xl
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between">
        <div className="shimmer-bg h-3 w-20 rounded-full" />
        <div className="shimmer-bg h-10 w-10 rounded-xl" />
      </div>
      <div className="shimmer-bg h-8 w-16 rounded-md" />
      <div className="shimmer-bg h-2.5 w-24 rounded-full" />
    </div>
  );
}

export default function DashboardHome() {
  const stats  = useQuery({ queryKey: ["dashboard-counts"], queryFn: counts });
  const recent = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: () => jsonrpcSearch<Record_>("asset", {
      page_size: 8, sort_by: "created_at", sort_order: "desc",
    }),
  });

  const cards = [
    {
      label: "Total Assets",
      value: stats.data?.total ?? 0,
      icon: Boxes,
      iconBg: "bg-surface-container-high",
      iconColor: "text-on-surface",
      trend: { dir: "up" as const, label: "+12% this month" },
    },
    {
      label: "Active",
      value: stats.data?.active ?? 0,
      icon: Activity,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: { dir: "up" as const, label: "Operational" },
    },
    {
      label: "Under Maintenance",
      value: stats.data?.maint ?? 0,
      icon: Wrench,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: { dir: "neutral" as const, label: "In service queue" },
    },
    {
      label: "Disposed",
      value: stats.data?.disposed ?? 0,
      icon: Trash2,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      trend: { dir: "down" as const, label: "End of lifecycle" },
    },
  ];

  const TrendIcon = (dir: "up" | "down" | "neutral") =>
    dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;

  const trendColor = (dir: "up" | "down" | "neutral") =>
    dir === "up" ? "text-emerald-600" : dir === "down" ? "text-rose-600" : "text-on-surface-variant";

  return (
    <div className="space-y-6">

      {/* Greeting — stitch: font-headline-lg */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-[24px] font-semibold text-on-surface tracking-tight leading-8">
          Enterprise Overview
        </h2>
        <p className="text-[14px] text-on-surface-variant mt-1">
          Here&apos;s what&apos;s happening across your asset portfolio today.
        </p>
      </motion.div>

      {/* Stat cards — stitch: bg-white rounded-2xl p-6 shadow-sm */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : cards.map((c, i) => {
              const Icon  = c.icon;
              const Trend = TrendIcon(c.trend.dir);
              return (
                <motion.div
                  key={c.label}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  // Stitch: bg-white p-6 rounded-2xl shadow-sm space-y-2
                  className="bg-white rounded-2xl p-6 space-y-2 cursor-default group"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-start justify-between">
                    {/* Stitch: label in text-on-surface-variant font-label-md */}
                    <p className="text-[12px] font-medium text-on-surface-variant tracking-wide">
                      {c.label}
                    </p>
                    {/* Stitch: icon in colored squircle w-10 h-10 rounded-xl */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${c.iconBg} transition-all group-hover:scale-110`}>
                      <Icon size={18} className={c.iconColor} />
                    </div>
                  </div>
                  {/* Stitch: large value text-3xl font-bold */}
                  <p className="text-3xl font-bold text-on-surface tabular-nums">{c.value.toLocaleString()}</p>
                  {/* Stitch: trend in small colored text */}
                  <div className={`flex items-center gap-1 text-[11px] font-semibold ${trendColor(c.trend.dir)}`}>
                    <Trend size={12} />
                    <span>{c.trend.label}</span>
                  </div>
                </motion.div>
              );
            })}
      </div>

      {/* Recent Assets table — stitch: bg-white rounded-2xl */}
      <motion.div
        variants={tableVariants}
        initial="hidden"
        animate="show"
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h3 className="text-[18px] font-semibold text-on-surface tracking-tight">Recent Assets</h3>
          <span className="text-[12px] text-on-surface-variant">
            {recent.data?.total ?? 0} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low text-left">
                <th className="px-6 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {recent.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-outline-variant/40">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="shimmer-bg h-3.5 rounded-full" style={{ width: `${60 + Math.random() * 30}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recent.data?.rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-on-surface-variant text-[14px]">
                    <div className="flex flex-col items-center gap-2">
                      <Boxes size={32} className="text-outline" />
                      <span>No assets yet. Add your first asset to get started.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                recent.data?.rows.map((a, i) => (
                  <motion.tr
                    key={String(a.id)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.04 }}
                    className="border-b border-outline-variant/40 hover:bg-surface-container-low/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono text-[12px] text-on-surface-variant">{String(a.code ?? "—")}</td>
                    <td className="px-6 py-4 font-medium text-on-surface group-hover:text-primary transition-colors">{String(a.name ?? "—")}</td>
                    <td className="px-6 py-4"><StatusBadge status={String(a.status ?? "")} /></td>
                    <td className="px-6 py-4 text-right tabular-nums text-on-surface">{formatCurrency(a.current_value)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
