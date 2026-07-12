"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/shared/store/auth.store";
import { authApi } from "@/shared/services/auth";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const QUOTES = [
  { text: "AssetFlow has transformed how we manage our global inventory. Audit cycles that took weeks now take hours.", author: "Sarah Chen", role: "COO, GlobalLogistics" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await authApi.login(email, password);
      setTokens({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
      const me = await authApi.me();
      setUser(me);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-background">

      {/* ── Left panel: brand / testimonial ── */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center p-12 overflow-hidden">
        {/* subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/[0.04] blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-white/[0.03] blur-[60px]" />

        <div className="relative z-10 max-w-md w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5 mb-16"
          >
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
              <span className="text-black text-sm font-black">A</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">AssetFlow</span>
          </motion.div>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-12 space-y-4"
          >
            <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              The operating system<br />for enterprise assets
            </h2>
            <p className="text-white/60 text-body-lg leading-relaxed">
              Real-time tracking, automated audits, and AI-driven depreciation — all in one place.
            </p>
          </motion.div>

          {[
            "Real-time lifecycle monitoring",
            "Automated audit cycles & compliance",
            "AI-powered depreciation tracking",
          ].map((feat, i) => (
            <motion.div
              key={feat}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-3 mb-3"
            >
              <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
              <span className="text-white/80 text-body-md">{feat}</span>
            </motion.div>
          ))}

          {/* Testimonial card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-12 glass-dark rounded-2xl p-6"
          >
            <p className="text-white/80 text-body-lg leading-relaxed mb-5 italic">
              &ldquo;{QUOTES[0].text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-label-md font-bold">
                SC
              </div>
              <div>
                <p className="text-white font-semibold text-body-md">{QUOTES[0].author}</p>
                <p className="text-white/50 text-label-md uppercase tracking-wider">{QUOTES[0].role}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Right panel: login form ── */}
      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">A</span>
            </div>
            <span className="font-bold text-on-surface">AssetFlow</span>
          </div>

          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Welcome back</h2>
            <p className="text-body-lg text-on-surface-variant mb-8">Sign in to your asset workspace.</p>
          </motion.div>

          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="space-y-2">
              <label htmlFor="email" className="text-label-md font-semibold text-on-surface block">
                Email address
              </label>
              <div className="relative group">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none transition-colors group-focus-within:text-on-surface" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#F4F4F4] rounded-xl text-body-md text-on-surface outline-none border border-transparent transition-all duration-200 placeholder:text-outline focus:bg-white focus:border-outline-variant focus:shadow-[0_0_0_3px_rgba(0,0,0,0.07)]"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-label-md font-semibold text-on-surface">Password</label>
                <a href="#" className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none transition-colors group-focus-within:text-on-surface" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-3 bg-[#F4F4F4] rounded-xl text-body-md text-on-surface outline-none border border-transparent transition-all duration-200 placeholder:text-outline focus:bg-white focus:border-outline-variant focus:shadow-[0_0_0_3px_rgba(0,0,0,0.07)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-error/20 bg-error-container px-4 py-3 text-body-md text-error"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="pt-1 space-y-3">
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-black text-white rounded-xl text-body-md font-semibold hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Sign In <ArrowRight size={15} /></span>
                )}
              </motion.button>

              <div className="relative flex items-center py-1">
                <div className="flex-1 border-t border-surface-variant" />
                <span className="px-4 text-label-md text-on-surface-variant bg-white">OR</span>
                <div className="flex-1 border-t border-surface-variant" />
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 border border-outline-variant rounded-xl text-body-md font-medium text-on-surface hover:bg-surface-container-low active:scale-[0.98] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </motion.div>
          </form>

          <motion.p
            custom={4} variants={fadeUp} initial="hidden" animate="show"
            className="mt-8 text-center text-body-md text-on-surface-variant"
          >
            Don&apos;t have an account?{" "}
            <a href="#" className="text-on-surface font-semibold hover:underline underline-offset-4 decoration-2">
              Sign up free
            </a>
          </motion.p>
        </div>
      </section>
    </main>
  );
}
