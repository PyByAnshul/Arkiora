"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/shared/store/auth.store";
import { authApi } from "@/shared/services/auth";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

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
    // Stitch: flex w-full min-h-screen bg-background (split layout)
    <main className="flex w-full min-h-screen" style={{ backgroundColor: "#f9f9f9" }}>

      {/* ── Left panel: black background + glass card quote ── */}
      {/* Stitch: hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-12 */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black items-center justify-center p-12">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/[0.04] blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-white/[0.03] blur-[60px]" />

        <div className="relative z-10 max-w-md w-full">
          {/* Logo — stitch: font-headline-md font-black text-white */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="text-[18px] font-black text-white tracking-tight">AssetFlow</span>
          </motion.div>

          {/* Glass card with testimonial quote — stitch: glass-card p-10 rounded-xl */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-10 rounded-xl"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "0.5px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            {/* Quote icon */}
            <div className="text-white text-4xl mb-6 leading-none select-none">&ldquo;</div>
            <h1 className="text-[24px] font-semibold text-white leading-tight tracking-tight mb-6">
              AssetFlow has transformed how we handle our global inventory.
            </h1>
            {/* Attribution */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-white text-[12px] font-bold">
                SC
              </div>
              <div>
                <p className="text-[12px] font-bold text-white">Sarah Chen</p>
                <p className="text-[11px] text-white/70 uppercase tracking-wider font-semibold">COO at GlobalLogistics</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Right panel: white background, login form ── */}
      {/* Stitch: w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white */}
      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-[400px]">

          {/* Mobile branding */}
          <div className="lg:hidden mb-12 flex justify-center">
            <span className="text-[18px] font-black text-black tracking-tight">AssetFlow</span>
          </div>

          {/* Header */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-10">
            <h2 className="text-[24px] font-semibold text-on-surface tracking-tight leading-8 mb-2">
              Welcome back
            </h2>
            <p className="text-[14px] text-on-surface-variant">
              Please enter your details to sign in.
            </p>
          </motion.div>

          <form onSubmit={submit} className="space-y-6">

            {/* Email */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="space-y-2">
              <label htmlFor="email" className="text-[12px] font-semibold text-on-surface block">
                Email address
              </label>
              <div className="relative group">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none transition-colors group-focus-within:text-on-surface"
                />
                {/* Stitch: bg-[#F4F4F4] border-transparent rounded-[8px] focus:bg-white focus:border-primary */}
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#F4F4F4] rounded-lg text-[14px] text-on-surface outline-none border border-transparent transition-all duration-200 placeholder:text-outline focus:bg-white focus:border-black focus:ring-0"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[12px] font-semibold text-on-surface">
                  Password
                </label>
                <a href="#" className="text-[12px] text-on-surface-variant hover:text-on-surface transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none transition-colors group-focus-within:text-on-surface"
                />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-[#F4F4F4] rounded-lg text-[14px] text-on-surface outline-none border border-transparent transition-all duration-200 placeholder:text-outline focus:bg-white focus:border-black focus:ring-0"
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

            {/* Remember me */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-outline-variant text-black focus:ring-black"
              />
              <label htmlFor="remember" className="text-[12px] text-on-surface-variant">
                Remember me for 30 days
              </label>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-error/20 bg-error-container px-4 py-3 text-[14px] text-error"
              >
                {error}
              </motion.div>
            )}

            {/* Actions */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="space-y-4 pt-2">
              {/* Primary CTA — stitch: bg-primary text-on-primary rounded-[8px] font-bold */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-black text-white rounded-lg text-[12px] font-bold hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In <ArrowRight size={14} />
                  </span>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-variant" />
                </div>
                <span className="relative px-4 bg-white text-[11px] font-semibold text-on-surface-variant">OR</span>
              </div>

              {/* Google SSO */}
              <button
                type="button"
                className="w-full py-3.5 border border-outline-variant rounded-lg text-[12px] font-bold text-on-surface hover:bg-surface-container-low active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </motion.div>
          </form>

          {/* Footer link */}
          <motion.p
            custom={5} variants={fadeUp} initial="hidden" animate="show"
            className="mt-12 text-center text-[14px] text-on-surface-variant"
          >
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-black font-bold hover:underline underline-offset-4 decoration-2">
              Sign up
            </Link>
          </motion.p>
        </div>
      </section>
    </main>
  );
}
