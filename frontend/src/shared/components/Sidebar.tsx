"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_NAV } from "@/lib/modules";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (slug: string) => {
    if (slug === "") return pathname === "/" || pathname === "/dashboard";
    return pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-outline bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-outline px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-white">
          <span className="text-title-sm font-bold">A</span>
        </div>
        <div className="leading-tight">
          <div className="text-title-sm font-semibold text-on-surface">AssetFlow</div>
          <div className="text-label-md text-on-surface-variant">ERP</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {SIDEBAR_NAV.map((item) => {
          const href = item.home ? "/dashboard" : `/${item.slug}`;
          const active = isActive(item.slug);
          const Icon = item.icon;
          return (
            <Link
              key={item.slug || "dashboard"}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2 text-body-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-outline px-5 py-3 text-label-md text-on-surface-variant">
        v1.0.0
      </div>
    </aside>
  );
}
