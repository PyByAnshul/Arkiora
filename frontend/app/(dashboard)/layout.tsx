"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/shared/components/Sidebar";
import { Topbar } from "@/shared/components/Topbar";
import { useAuthStore } from "@/shared/store/auth.store";
import { MODULES } from "@/lib/modules";

function titleFor(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!seg) return "Dashboard";
  return MODULES[seg]?.label ?? seg.charAt(0).toUpperCase() + seg.slice(1);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!accessToken) router.replace("/login");
    else setChecked(true);
  }, [accessToken, router]);

  if (!accessToken || !checked) {
    return (
      <div className="flex h-screen items-center justify-center text-on-surface-variant">Loading…</div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={titleFor(pathname)} />
        <main className="flex-1 overflow-y-auto p-container">{children}</main>
      </div>
    </div>
  );
}
