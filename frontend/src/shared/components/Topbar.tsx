"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, LogOut, Search, ChevronDown, Settings } from "lucide-react";
import { useAuthStore } from "@/shared/store/auth.store";
import { authApi } from "@/shared/services/auth";
import { initials } from "@/lib/utils";

const MOCK_NOTIFS = [
  { id: 1, text: "Audit cycle #42 completed",      time: "2m ago",   dot: "bg-emerald-400" },
  { id: 2, text: "Maintenance ticket #1042 opened", time: "18m ago",  dot: "bg-amber-400" },
  { id: 3, text: "5 assets transferred to Ops",     time: "1h ago",   dot: "bg-accent-blue" },
];

export function Topbar({ title }: { title: string }) {
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = async () => {
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch { /* ignore */ }
    }
    logout();
    router.replace("/login");
  };

  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between glass border-b border-white/10 px-6 z-20">

      {/* Left — breadcrumb title */}
      <motion.h1
        key={title}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-headline-md font-semibold text-on-surface"
      >
        {title}
      </motion.h1>

      {/* Right controls */}
      <div className="flex items-center gap-2">

        {/* Search bar */}
        <motion.div
          animate={{ width: searchFocused ? 220 : 160 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative hidden sm:block"
        >
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-9 pl-8 pr-3 bg-surface-container rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/60 outline-none border border-transparent focus:border-outline-variant focus:bg-white transition-all duration-200"
          />
        </motion.div>

        {/* Notification bell */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setNotifOpen((o) => !o)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} className="text-on-surface-variant" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-11 z-50 w-80 glass-card rounded-xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                    <span className="text-body-md font-semibold text-on-surface">Notifications</span>
                    <span className="text-label-md text-accent-blue cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="divide-y divide-outline-variant">
                    {MOCK_NOTIFS.map((n) => (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low/60 transition-colors cursor-pointer">
                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-body-md text-on-surface leading-snug">{n.text}</p>
                          <p className="text-label-md text-on-surface-variant mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-outline-variant text-center">
                    <span className="text-label-md text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors">View all notifications</span>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Settings shortcut */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
          aria-label="Settings"
        >
          <Settings size={16} className="text-on-surface-variant" />
        </motion.button>

        {/* User avatar + menu */}
        <div className="flex items-center gap-2 pl-2 border-l border-outline-variant ml-1">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-on-surface text-white text-label-md font-semibold select-none cursor-default"
          >
            {user ? initials(user.email) : "?"}
          </motion.div>
          <div className="hidden sm:block text-right leading-tight">
            <div className="text-body-md font-medium text-on-surface truncate max-w-[120px]">{user?.email ?? "—"}</div>
            <div className="text-label-md text-on-surface-variant">{user?.is_superadmin ? "Super Admin" : "User"}</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleLogout}
            className="ml-1 h-8 w-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
