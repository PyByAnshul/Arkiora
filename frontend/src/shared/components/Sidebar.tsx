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
    if (slug === "") return pathname === "/" || pathname === "/dashboard";
    return pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  };

  return (
    <motion.aside
      variants={containerVariants}
      initial="hidden"
      animate="show"
      // Stitch spec: w-[260px], bg-white/20 backdrop-blur-2xl, border-r border-white/20
      className="flex w-[260px] shrink-0 flex-col h-full z-30 bg-white/20 backdrop-blur-2xl border-r border-white/20"
    >
      {/* Logo — stitch: w-10 h-10 rounded-xl bg-primary icon + title + subtitle */}
      <div className="flex items-center gap-3 px-4 py-4 mb-2 border-b border-white/10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          // Stitch: w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-black shadow-sm flex-shrink-0"
        >
          {/* account_balance_wallet icon — using SVG since we don't have Material Symbols */}
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M21 7.28V5c0-1.1-.9-2-2-2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"/>
            <circle cx="16" cy="12" r="1.5"/>
          </svg>
        </motion.div>
        <div className="leading-tight">
          {/* Stitch: font-headline-md text-headline-md font-black */}
          <div className="text-[18px] font-black text-on-surface tracking-tight leading-none">AssetFlow</div>
          {/* Stitch: font-label-md text-label-md text-on-surface-variant */}
          <div className="text-[12px] font-medium text-on-surface-variant tracking-wide mt-0.5">Enterprise ERP</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {SIDEBAR_NAV.map((item) => {
          const href   = item.home ? "/dashboard" : `/${item.slug}`;
          const active = item.home
            ? pathname === "/dashboard"
            : isActive(item.slug);
          const Icon = item.icon;

          return (
            <motion.div key={item.slug || "dashboard"} variants={itemVariants}>
              <Link href={href} className="block relative">
                {/* Active pill background — stitch: bg-white rounded-xl with subtle shadow */}
                <AnimatePresence>
                  {active && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-xl bg-white"
                      style={{
                        boxShadow: "0 1px 4px rgba(0,0,0,0.10), inset 0 0.5px 0 rgba(255,255,255,0.8)",
                      }}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                {/* Stitch: flex items-center gap-3 px-3 py-2.5 rounded-xl */}
                <span
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-colors duration-150",
                    active
                      ? "text-on-surface font-semibold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/40"
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
        <span className="text-[11px] font-medium text-on-surface-variant">v1.0.0 · All systems normal</span>
      </div>
    </motion.aside>
  );
}
