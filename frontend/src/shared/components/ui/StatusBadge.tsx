import { cn } from "@/lib/utils";

// Luminous Enterprise pastel badge palette:
// Each status maps to a (bg, text) pastel pair per the design spec
const STATUS_STYLES: Record<string, string> = {
  // Asset lifecycle
  draft:             "bg-surface-container-high     text-on-surface-variant",
  active:            "bg-emerald-100                text-emerald-800",
  under_maintenance: "bg-amber-100                  text-amber-800",
  disposed:          "bg-rose-100                   text-rose-800",
  written_off:       "bg-rose-100                   text-rose-800",

  // Allocation / requests
  pending:    "bg-blue-50   text-blue-700",
  requested:  "bg-blue-50   text-blue-700",
  approved:   "bg-emerald-50 text-emerald-700",
  allocated:  "bg-emerald-100 text-emerald-800",
  returned:   "bg-surface-container text-on-surface-variant",
  rejected:   "bg-rose-100  text-rose-800",
  cancelled:  "bg-surface-container text-on-surface-variant",

  // Work orders / maintenance
  open:        "bg-amber-50  text-amber-700",
  in_progress: "bg-amber-100 text-amber-800",
  resolved:    "bg-emerald-100 text-emerald-800",
  closed:      "bg-surface-container text-on-surface-variant",

  // Audits / cycles
  planned:    "bg-violet-50  text-violet-700",
  in_review:  "bg-violet-100 text-violet-800",
  completed:  "bg-emerald-100 text-emerald-800",
};

const LABEL_MAP: Record<string, string> = {
  under_maintenance: "Maintenance",
  in_progress:       "In Progress",
  written_off:       "Written Off",
  in_review:         "In Review",
};

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const cls    = STATUS_STYLES[status] ?? "bg-surface-container text-on-surface-variant";
  const label  = LABEL_MAP[status] ?? status.replace(/_/g, " ");

  return (
    <span className={cn(
      "badge capitalize",
      cls
    )}>
      {label}
    </span>
  );
}
