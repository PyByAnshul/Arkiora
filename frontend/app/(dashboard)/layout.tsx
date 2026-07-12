"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  const router      = useRouter();
  const pathname    = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!accessToken) router.replace("/login");
    else setChecked(true);
  }, [accessToken, router]);

  if (!accessToken || !checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-on-surface-variant/30 border-t-on-surface rounded-full animate-spin" />
          <span className="text-body-md text-on-surface-variant">Loading workspace…</span>
        </div>
      </div>
    );
  }

  return (
    // canvas = Level 0 bone-white (#E5E5E2) per Luminous spec
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={titleFor(pathname)} />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 overflow-y-auto p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
