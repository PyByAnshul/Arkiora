"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  BarChart3, Shield, Zap, Globe, ArrowRight, ChevronRight,
  Activity, Package, Wrench, CheckCircle, TrendingUp, Bell,
  LayoutDashboard, Search, Settings
} from "lucide-react";

// ── Fade-up animation variant ──────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

// ── Section wrapper with scroll-triggered reveal ──────────────────────────
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

// ── Particle dots background ───────────────────────────────────────────────
function ParticleDots() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-black/[0.035]"
          style={{
            width:  Math.random() * 6 + 3,
            height: Math.random() * 6 + 3,
            left:   `${Math.random() * 100}%`,
            top:    `${Math.random() * 100}%`,
          }}
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Mini Dashboard Mockup ─────────────────────────────────────────────────
function DashboardMockup() {
  const items = [
    { label: "Total Assets", value: "12,482", trend: "+12%", color: "text-emerald-600" },
    { label: "Audit Health",  value: "98.4%",  trend: "Excellent", color: "text-accent-blue" },
    { label: "Pending Maint.", value: "24",   trend: "3 urgent",  color: "text-red-500" },
  ];

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Package,         label: "Assets",    active: false },
    { icon: Wrench,          label: "Maintenance", active: false },
    { icon: BarChart3,       label: "Reports",   active: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-white/50 shadow-2xl"
      style={{ background: "#E5E5E2" }}
    >
      {/* glare overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent z-10" />

      <div className="flex h-[420px] sm:h-[480px]">
        {/* Sidebar */}
        <aside className="hidden sm:flex w-52 h-full flex-col p-5 gap-4 sidebar-glass">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <span className="font-semibold text-sm text-on-surface">AssetFlow</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((n) => (
              <div
                key={n.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  n.active ? "bg-white shadow-sm text-on-surface font-semibold" : "text-on-surface-variant hover:bg-white/40"
                }`}
              >
                <n.icon size={15} />
                {n.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden space-y-5">
          {/* header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-on-surface">Enterprise Overview</h2>
            <div className="flex gap-2">
              {[Search, Bell].map((Icon, i) => (
                <div key={i} className="w-8 h-8 bg-white/70 rounded-lg flex items-center justify-center border border-white/50">
                  <Icon size={14} className="text-on-surface-variant" />
                </div>
              ))}
            </div>
          </div>

          {/* stat cards */}
          <div className="grid grid-cols-3 gap-3">
            {items.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-sm space-y-1"
              >
                <p className="text-[10px] text-on-surface-variant font-medium">{c.label}</p>
                <p className="text-xl font-bold text-on-surface">{c.value}</p>
                <p className={`text-[10px] font-semibold ${c.color}`}>{c.trend}</p>
              </motion.div>
            ))}
          </div>

          {/* activity list */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-on-surface">Recent Activity</span>
              <span className="text-[10px] text-on-surface-variant">View all</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Laptop-MBP-2024 assigned",  time: "2m ago",  dot: "bg-emerald-400" },
                { label: "Maintenance ticket #1042",  time: "18m ago", dot: "bg-amber-400" },
                { label: "Audit cycle completed",      time: "1h ago",  dot: "bg-accent-blue" },
                { label: "5 assets transferred",       time: "3h ago",  dot: "bg-purple-400" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.dot}`} />
                  <span className="text-[11px] text-on-surface flex-1 truncate">{r.label}</span>
                  <span className="text-[10px] text-on-surface-variant">{r.time}</span>
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
    desc: "Track every asset from procurement to disposal. Instant visibility into location, condition, and usage across global facilities.",
    accent: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  },
  {
    icon: Shield,
    title: "Automated Audit Cycles",
    desc: "Eliminate manual spreadsheets. Schedule automated verification tasks and maintain a perfect compliance trail for all audits.",
    accent: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
  },
  {
    icon: TrendingUp,
    title: "Smart Depreciation Tracking",
    desc: "Predict financial impact with AI. Auto-calculate asset depreciation using multiple methods for precise tax reporting.",
    accent: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
  },
  {
    icon: Globe,
    title: "Multi-location Management",
    desc: "Manage assets across regions, buildings, and departments from a single pane. Full RBAC with location-scoped access.",
    accent: "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    desc: "Trigger automated workflows for maintenance requests, transfer approvals, and audit reminders without manual intervention.",
    accent: "bg-yellow-50 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    desc: "Turn raw asset data into insights. Custom dashboards, export-ready reports, and KPI tracking built right in.",
    accent: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
  },
];

const STATS = [
  { value: "500+",  label: "Enterprise Clients" },
  { value: "2.4M",  label: "Assets Tracked" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "40%",   label: "Audit Time Saved" },
];

// ── Main Page Export ──────────────────────────────────────────────────────
export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(249,249,249,0)", "rgba(249,249,249,0.92)"]);
  const navBlur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(20px)"]);

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden">

      {/* ── Topnav ── */}
      <motion.nav
        style={{ backgroundColor: navBg, backdropFilter: navBlur }}
        className="fixed top-0 inset-x-0 z-50 h-16 border-b border-transparent transition-colors"
      >
        <div className="page-container h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-black">A</span>
              </div>
              <span className="font-bold text-base text-on-surface tracking-tight">AssetFlow</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {["Product", "Features", "Pricing", "Docs"].map((l) => (
                <a key={l} href="#" className="text-body-md text-on-surface-variant hover:text-on-surface transition-colors">
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-body-md text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-container">
              Login
            </Link>
            <Link href="/login" className="flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-lg text-body-md font-medium hover:bg-zinc-800 active:scale-95 transition-all">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.nav>

      <main>
        {/* ── Hero ── */}
        <section className="relative pt-32 pb-24 px-6 overflow-hidden">
          <ParticleDots />
          {/* blue glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-accent-blue/[0.05] blur-[120px] -z-0" />

          <div className="page-container relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white border border-outline-variant rounded-full px-4 py-1.5 text-label-md text-on-surface-variant mb-8 shadow-card"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              Now open-source — star us on GitHub
              <ChevronRight size={13} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-on-surface leading-[1.08] mb-6 text-balance"
            >
              The Future of{" "}
              <span className="text-gradient-blue">Enterprise</span>
              <br />Asset Management
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Streamline operations with real-time lifecycle monitoring, automated auditing,
              and AI-driven depreciation tracking — in one unified interface.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="flex flex-col sm:flex-row justify-center gap-3 mb-20"
            >
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-xl text-headline-md font-semibold hover:bg-zinc-800 active:scale-95 transition-all shadow-xl"
              >
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <button className="flex items-center justify-center gap-2 bg-white border border-outline-variant px-8 py-4 rounded-xl text-headline-md font-medium hover:bg-surface-container-low transition-all shadow-card">
                Watch Demo
              </button>
            </motion.div>

            <DashboardMockup />
          </div>
        </section>

        {/* ── Social Proof ── */}
        <section className="py-16 bg-surface-container-low/40">
          <div className="page-container text-center">
            <Reveal>
              <p className="label-text mb-10">Trusted by industry leaders</p>
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-700">
                {["Aerospace Co.", "FinanceGroup", "TechCorp", "LogisticsCo.", "MfgIndustries"].map((name) => (
                  <span key={name} className="text-headline-md font-black text-on-surface tracking-tight">{name}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Stats Band ── */}
        <section className="py-20 bg-white border-y border-outline-variant">
          <div className="page-container">
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
                  <p className="text-body-md text-on-surface-variant mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Features Bento ── */}
        <section className="py-32 px-6">
          <div className="page-container">
            <Reveal className="text-center mb-16">
              <p className="label-text mb-3">What&apos;s inside</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface text-balance mb-4">
                Everything you need to run<br />a modern asset operation
              </h2>
              <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
                Purpose-built for enterprise scale — not bolted on as an afterthought.
              </p>
            </Reveal>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {FEATURES.map((f) => (
                <motion.div key={f.title} variants={fadeUp} className="bento-card group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${f.accent}`}>
                    <f.icon size={22} />
                  </div>
                  <h3 className="text-headline-md text-on-surface">{f.title}</h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-6">
          <div className="page-container">
            <Reveal>
              <div className="cta-surface p-16 text-center">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-label-md text-white/80 mb-8">
                    <CheckCircle size={13} className="text-emerald-400" />
                    No credit card required · Free forever plan
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight text-balance">
                    Ready to optimize your assets?
                  </h2>
                  <p className="text-white/70 text-body-lg max-w-xl mx-auto mb-10">
                    Join 500+ enterprises that have revolutionized their operations
                    with AssetFlow&apos;s intelligent management system.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/login" className="flex items-center justify-center gap-2 bg-white text-black px-10 py-4 rounded-xl text-headline-md font-semibold hover:bg-neutral-100 active:scale-95 transition-all">
                      Get Started Now <ArrowRight size={16} />
                    </Link>
                    <button className="flex items-center justify-center gap-2 border border-white/20 text-white px-10 py-4 rounded-xl text-headline-md font-medium hover:bg-white/10 transition-all">
                      Contact Sales
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-surface border-t border-outline-variant py-16 px-6">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-black">A</span>
                </div>
                <span className="font-bold text-on-surface">AssetFlow</span>
              </div>
              <p className="text-body-md text-on-surface-variant max-w-xs leading-relaxed">
                The intelligence layer for enterprise physical assets. Built for modern infrastructure at scale.
              </p>
            </div>
            {[
              { heading: "Product",   links: ["Overview", "Features", "Solutions", "Integrations"] },
              { heading: "Company",   links: ["About Us", "Careers", "Press", "Blog"] },
              { heading: "Resources", links: ["Documentation", "Help Center", "Security", "Legal"] },
            ].map((col) => (
              <div key={col.heading} className="space-y-3">
                <h4 className="label-text">{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-body-md text-on-surface-variant hover:text-on-surface transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="divider pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-label-md text-on-surface-variant">
            <span>© 2024 AssetFlow Inc. All rights reserved.</span>
            <div className="flex gap-6">
              {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((l) => (
                <a key={l} href="#" className="hover:text-on-surface transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
