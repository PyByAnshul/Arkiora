import { type ClassValue } from "./types";

/** Tiny className combiner (avoids pulling in clsx for a one-liner). */
export function cn(...classes: ClassValue[]): string {
  return classes
    .flat()
    .filter(Boolean)
    .join(" ");
}

export function formatCurrency(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function formatDate(value: unknown): string {
  if (!value) return "—";
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

export function initials(email: string): string {
  const part = email.split("@")[0] ?? "?";
  return part.slice(0, 2).toUpperCase();
}
