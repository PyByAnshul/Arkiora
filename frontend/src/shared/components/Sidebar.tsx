"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SIDEBAR_NAV } from "@/lib/modules";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { x: -20, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { x: -10, opacity: 0 },
  show:   { x: 0,   opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (slug: string) => {
    if (slug === "") return pathname === "/" || pathname === "/dashboard" || pathname === "/assets" && false;
    return pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  };

  return (
    <motion.aside
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="sidebar-glass flex w-64 shrink-0 flex-col h-full z-30"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-black shadow-sm flex-shrink-0"
        >
          <span className="text-white text-sm font-black">A</span>
        </motion.div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-on-surface tracking-tight">AssetFlow</div>
          <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">Enterprise ERP</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        <p className="label-text px-3 mb-3 text-[10px]">Navigation</p>

        {SIDEBAR_NAV.map((item) => {
          const href   = item.home ? "/dashboard" : `/${item.slug}`;
          const active = item.home
            ? pathname === "/dashboard"
            : isActive(item.slug);
          const Icon = item.icon;

          return (
            <motion.div key={item.slug || "dashboard"} variants={itemVariants}>
              <Link href={href} className="block relative">
                {/* active pill background */}
                <AnimatePresence>
                  {active && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-xl bg-white"
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.10), inset 0 0.5px 0 rgba(255,255,255,0.8)" }}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                <span
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-md font-medium transition-colors duration-150",
                    active
                      ? "text-on-surface font-semibold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/40"
                  )}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="sidebar-active-dot"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-on-surface"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
        <span className="text-label-md text-on-surface-variant">v1.0.0 · All systems normal</span>
      </div>
    </motion.aside>
  );
}
