import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  // Asset lifecycle (per design system)
  draft: "bg-surface-container text-on-surface-variant",
  active: "bg-success-container text-success",
  under_maintenance: "bg-warning-container text-warning",
  disposed: "bg-error-container text-error",
  written_off: "bg-error-container text-error",
  // Allocation / generic
  pending: "bg-info-container text-info",
  requested: "bg-info-container text-info",
  approved: "bg-info-container text-info",
  allocated: "bg-success-container text-success",
  returned: "bg-surface-container text-on-surface-variant",
  resolved: "bg-success-container text-success",
  closed: "bg-surface-container text-on-surface-variant",
  open: "bg-warning-container text-warning",
  in_progress: "bg-warning-container text-warning",
  planned: "bg-info-container text-info",
  in_review: "bg-info-container text-info",
  completed: "bg-success-container text-success",
  rejected: "bg-error-container text-error",
  cancelled: "bg-surface-container text-on-surface-variant",
};

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const cls = STATUS_STYLES[status] ?? "bg-surface-container text-on-surface-variant";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-label-md font-medium", cls)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
