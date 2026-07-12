"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  BarChart3, Shield, Zap, Globe, ArrowRight, ChevronRight,
  Activity, Package, Wrench, TrendingUp, Bell, Search,
  LayoutDashboard, CheckCircle, FileText, Settings, Plus,
  AlertTriangle, CheckCircle2, Clock, X,
} from "lucide-react";

// ── Fade-up animation ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Mini Dashboard Mockup (inside hero) ───────────────────────────────────
function DashboardMockup() {
  const statItems = [
    { label: "Total Assets", value: "12,482", trend: "+12%",     trendColor: "text-emerald-600" },
    { label: "Audit Health",  value: "98.4%",  trend: "Excellent", trendColor: "text-accent-blue" },
    { label: "Pending Maint.", value: "24",    trend: "3 urgent",  trendColor: "text-red-500" },
  ];
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true  },
    { icon: Package,          label: "Assets",    active: false },
    { icon: Wrench,           label: "Maintenance", active: false },
    { icon: BarChart3,        label: "Reports",   active: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      // Stitch: bg-[#E5E5E2] rounded-2xl overflow-hidden border border-white/40 shadow-2xl
      className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden border border-white/40 shadow-2xl"
      style={{ background: "#E5E5E2" }}
    >
      <div className="flex h-[420px] sm:h-[480px]">
        {/* Sidebar — stitch: sidebar-glass w-[240px] p-6 flex flex-col gap-6 */}
        <aside
          className="hidden sm:flex w-[240px] h-full flex-col p-6 gap-6"
          style={{
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <span className="text-[18px] font-black text-on-surface tracking-tight">AssetFlow</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((n) => (
              <div
                key={n.label}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${
                  n.active
                    ? "bg-white shadow-sm text-on-surface font-semibold"
                    : "text-on-surface-variant hover:bg-white/40"
                }`}
              >
                <n.icon size={15} />
                {n.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <div className="flex-1 p-8 text-left space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-[24px] font-semibold text-on-surface tracking-tight">Enterprise Overview</h2>
            <div className="flex gap-2">
              {[Search, Bell].map((Icon, i) => (
                <div key={i} className="bg-white/70 p-2 rounded-lg border border-white/50">
                  <Icon size={14} className="text-on-surface-variant" />
                </div>
              ))}
            </div>
          </div>

          {/* Stat cards — stitch: grid grid-cols-3 gap-6 */}
          <div className="grid grid-cols-3 gap-6">
            {statItems.map((c) => (
              <div key={c.label} className="bg-white p-6 rounded-2xl space-y-2"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <span className="text-[12px] text-on-surface-variant font-medium">{c.label}</span>
                <div className="text-3xl font-bold text-on-surface">{c.value}</div>
                <span className={`text-xs font-bold ${c.trendColor}`}>{c.trend}</span>
              </div>
            ))}
          </div>

          {/* Activity list */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[18px] font-semibold text-on-surface">Recent Activity</span>
              <span className="text-[12px] text-on-surface-variant">View all</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Laptop-MBP-2024 assigned",  time: "2m ago",  dot: "bg-emerald-400" },
                { label: "Maintenance ticket #1042",  time: "18m ago", dot: "bg-amber-400" },
                { label: "Audit cycle completed",      time: "1h ago",  dot: "bg-accent-blue" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.dot}`} />
                  <span className="text-[12px] text-on-surface flex-1 truncate">{r.label}</span>
                  <span className="text-[11px] text-on-surface-variant">{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Feature data ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Activity,
    title: "Real-time Lifecycle Monitoring",
    desc: "Track every asset from procurement to disposal. Get instant visibility into location, condition, and usage metrics across global facilities.",
    // Stitch: bg-surface-container-high rounded-xl icon container, hover bg-accent-blue
    iconBg: "bg-surface-container-high text-accent-blue group-hover:bg-accent-blue group-hover:text-white",
  },
  {
    icon: Shield,
    title: "Automated Audit Cycles",
    desc: "Eliminate manual spreadsheets. Schedule automated verification tasks and maintain a perfect compliance trail for all audits.",
    iconBg: "bg-surface-container-high text-accent-blue group-hover:bg-accent-blue group-hover:text-white",
  },
  {
    icon: TrendingUp,
    title: "Smart Depreciation Tracking",
    desc: "Leverage AI to predict financial impact. Automatically calculate asset depreciation using multiple methods for precise tax reporting.",
    iconBg: "bg-surface-container-high text-accent-blue group-hover:bg-accent-blue group-hover:text-white",
  },
  {
    icon: Globe,
    title: "Multi-location Management",
    desc: "Manage assets across regions, buildings, and departments from a single pane. Full RBAC with location-scoped access.",
    iconBg: "bg-surface-container-high text-accent-blue group-hover:bg-accent-blue group-hover:text-white",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    desc: "Trigger automated workflows for maintenance requests, transfer approvals, and audit reminders without manual intervention.",
    iconBg: "bg-surface-container-high text-accent-blue group-hover:bg-accent-blue group-hover:text-white",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    desc: "Turn raw asset data into insights. Custom dashboards, export-ready reports, and KPI tracking built right in.",
    iconBg: "bg-surface-container-high text-accent-blue group-hover:bg-accent-blue group-hover:text-white",
  },
];

const STATS = [
  { value: "500+",  label: "Enterprise Clients" },
  { value: "2.4M",  label: "Assets Tracked" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "40%",   label: "Audit Time Saved" },
];

// ── Main Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { scrollY } = useScroll();
  // Stitch: sticky nav with bg-surface/80 backdrop-blur-3xl
  const navBg   = useTransform(scrollY, [0, 80], ["rgba(249,249,249,0)", "rgba(249,249,249,0.85)"]);
  const navBlur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(24px)"]);

  return (
    // Stitch: body background-color #f9f9f9 (landing uses #f9f9f9, not canvas)
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#f9f9f9", color: "#1a1c1c" }}>

      {/* ── Top Navigation — stitch: w-full sticky top-0 z-50 bg-surface/80 backdrop-blur border-b border-white/20 px-6 h-16 ── */}
      <motion.nav
        style={{ backgroundColor: navBg, backdropFilter: navBlur }}
        className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/20 px-6 flex justify-between items-center"
      >
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">A</span>
            </div>
            {/* Stitch: font-headline-md font-bold text-primary */}
            <span className="text-[18px] font-bold text-black tracking-tight">AssetFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {["Product", "Features", "Pricing"].map((l) => (
              <a key={l} href="#" className="text-[14px] text-on-surface-variant hover:text-black transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Stitch: text-label-md text-on-surface-variant px-4 py-2 hover:bg-surface-container-high rounded-lg */}
          <Link
            href="/login"
            className="text-[12px] font-medium text-on-surface-variant px-4 py-2 hover:bg-surface-container-high rounded-lg transition-all"
          >
            Login
          </Link>
          {/* Stitch: bg-primary text-on-primary font-label-md px-5 py-2.5 rounded-lg */}
          <Link
            href="/signup"
            className="flex items-center gap-1.5 bg-black text-white text-[12px] font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-800 active:scale-95 transition-all"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      <main className="relative">

        {/* ── Hero Section ── */}
        <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto text-center relative">
          {/* Blue glow — stitch: absolute blur-[120px] bg-accent-blue/5 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-blue/5 blur-[120px] -z-10 rounded-full" />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white border border-outline-variant rounded-full px-4 py-1.5 text-[12px] text-on-surface-variant mb-8"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
            Now open-source — star us on GitHub
            <ChevronRight size={13} />
          </motion.div>

          {/* Stitch: text-6xl md:text-7xl font-extrabold tracking-tight text-primary */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-black leading-[1.08] mb-6"
          >
            The Future of Enterprise <br />
            <span className="text-accent-blue">Asset Management</span>
          </motion.h1>

          {/* Stitch: font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="text-[16px] text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Streamline operations with real-time lifecycle monitoring, automated auditing,
            and AI-driven depreciation tracking in one unified glassmorphic interface.
          </motion.p>

          {/* CTA buttons — stitch: bg-black text-white px-8 py-4 rounded-xl + ghost border */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-20"
          >
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-xl text-[18px] font-semibold hover:bg-zinc-800 active:scale-95 transition-all shadow-xl"
            >
              Start Free Trial <ArrowRight size={16} />
            </Link>
            <button className="flex items-center justify-center gap-2 bg-white border border-outline-variant px-8 py-4 rounded-xl text-[18px] font-medium hover:bg-surface-container-low transition-all"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              Watch Demo
            </button>
          </motion.div>

          <DashboardMockup />
        </section>

        {/* ── Social Proof ── */}
        {/* Stitch: py-16 bg-surface-container-low/30 */}
        <section className="py-16" style={{ backgroundColor: "rgba(243,243,243,0.3)" }}>
          <div className="max-w-7xl mx-auto px-6 text-center">
            <Reveal>
              {/* Stitch: font-label-md tracking-widest uppercase text-on-surface-variant */}
              <p className="text-[12px] font-medium text-on-surface-variant mb-10 tracking-widest uppercase">
                Trusted by industry titans
              </p>
              <div className="flex flex-wrap justify-center items-center gap-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-70 transition-all duration-700">
                {["Aerospace Co.", "FinanceGroup", "TechCorp", "LogisticsCo.", "MfgIndustries"].map((name) => (
                  <span key={name} className="text-[18px] font-black text-on-surface tracking-tight">{name}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Stats Band ── */}
        <section className="py-20 bg-white border-y border-outline-variant">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            >
              {STATS.map((s) => (
                <motion.div key={s.label} variants={fadeUp}>
                  <p className="text-4xl font-extrabold text-on-surface tracking-tight">{s.value}</p>
                  <p className="text-[14px] text-on-surface-variant mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Features Bento — stitch: grid grid-cols-1 md:grid-cols-3 gap-8 ── */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <Reveal className="text-center mb-16">
              <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-widest mb-4">
                What&apos;s inside
              </p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface mb-4">
                Everything you need to run<br />a modern asset operation
              </h2>
              <p className="text-[16px] text-on-surface-variant max-w-xl mx-auto">
                Purpose-built for enterprise scale — not bolted on as an afterthought.
              </p>
            </Reveal>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {FEATURES.map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  // Stitch: bg-white p-10 rounded-2xl space-y-6 hover:shadow-xl group border border-transparent hover:border-surface-variant
                  className="bg-white p-10 rounded-2xl space-y-6 hover:shadow-xl transition-all duration-500 group border border-transparent hover:border-surface-variant cursor-default"
                >
                  {/* Stitch: w-14 h-14 bg-surface-container-high rounded-xl icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${f.iconBg}`}>
                    <f.icon size={28} />
                  </div>
                  {/* Stitch: font-headline-lg text-headline-lg text-primary */}
                  <h3 className="text-[24px] font-semibold text-black tracking-tight">{f.title}</h3>
                  {/* Stitch: font-body-md text-on-surface-variant leading-relaxed */}
                  <p className="text-[14px] text-on-surface-variant leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA Section — stitch: bg-primary rounded-3xl p-16 ── */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <div
                className="bg-black rounded-3xl p-16 text-center relative overflow-hidden"
              >
                {/* Subtle radial glow inside CTA */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)",
                  }}
                />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-[12px] text-white/80 mb-8">
                    <CheckCircle size={13} className="text-emerald-400" />
                    No credit card required · Free forever plan
                  </div>
                  {/* Stitch: font-headline-lg text-5xl font-bold text-white */}
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
                    Ready to optimize your assets?
                  </h2>
                  <p className="text-white/70 text-[16px] max-w-xl mx-auto mb-10 leading-relaxed">
                    Join 500+ enterprises that have revolutionized their operations with
                    AssetFlow&apos;s intelligent management system.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    {/* Stitch: bg-white text-black px-10 py-4 rounded-xl */}
                    <Link
                      href="/signup"
                      className="flex items-center justify-center gap-2 bg-white text-black px-10 py-4 rounded-xl text-[18px] font-semibold hover:bg-neutral-100 active:scale-95 transition-all"
                    >
                      Get Started Now <ArrowRight size={16} />
                    </Link>
                    {/* Stitch: bg-transparent border border-white/20 text-white */}
                    <button className="flex items-center justify-center border border-white/20 text-white px-10 py-4 rounded-xl text-[18px] font-medium hover:bg-white/10 transition-all">
                      Contact Sales
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── Footer — stitch: bg-surface border-t border-white/20 py-20 ── */}
      <footer className="border-t border-white/20 py-20 px-6" style={{ backgroundColor: "#f9f9f9" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-black">A</span>
              </div>
              {/* Stitch: font-headline-md font-bold text-primary */}
              <span className="text-[18px] font-bold text-black tracking-tight">AssetFlow</span>
            </div>
            <p className="text-[14px] text-on-surface-variant max-w-xs leading-relaxed">
              The intelligence layer for enterprise physical assets. Built for modern
              infrastructure at scale.
            </p>
            {/* Social icons — stitch: w-10 h-10 rounded-full bg-surface-container-high */}
            <div className="flex gap-4">
              {["share", "public"].map((icon) => (
                <div
                  key={icon}
                  className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-accent-blue hover:text-white transition-all cursor-pointer text-on-surface-variant"
                >
                  <span className="text-xs font-bold">{icon === "share" ? "↗" : "🌐"}</span>
                </div>
              ))}
            </div>
          </div>

          {[
            { heading: "Product",   links: ["Overview", "Features", "Solutions", "Integrations"] },
            { heading: "Company",   links: ["About Us", "Careers", "Press", "Blog"] },
            { heading: "Resources", links: ["Documentation", "Help Center", "Security", "Legal"] },
          ].map((col) => (
            <div key={col.heading} className="space-y-4">
              {/* Stitch: font-label-md font-bold text-primary */}
              <h4 className="text-[12px] font-bold text-black tracking-wide">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[14px] text-on-surface-variant hover:text-black transition-colors cursor-pointer">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-on-surface-variant">
          <span>© 2024 AssetFlow Inc. All rights reserved.</span>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((l) => (
              <a key={l} href="#" className="hover:text-black transition-colors cursor-pointer">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
