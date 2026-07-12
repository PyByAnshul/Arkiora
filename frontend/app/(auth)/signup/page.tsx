"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from "lucide-react";
import { authApi } from "@/shared/services/auth";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

// Password strength helper
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "bg-red-500" };
  if (score <= 3) return { score, label: "Fair",   color: "bg-amber-400" };
  return            { score, label: "Strong", color: "bg-emerald-500" };
}

export default function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  const strength = getStrength(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await authApi.register({
        email,
        password,
        first_name: firstName.trim() || undefined,
        last_name:  lastName.trim()  || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Stitch: min-h-screen flex items-stretch
    <main className="flex min-h-screen w-full">

      {/* ── Left panel: surface-container-low + glass feature card ── */}
      {/* Stitch: hidden lg:flex lg:w-1/2 relative bg-surface-container-low items-center justify-center p-12 */}
      <section
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{ backgroundColor: "#f3f3f3" }}
      >
        {/* Decorative blobs */}
        <div className="absolute bottom-12 right-12 opacity-50">
          <div className="w-64 h-64 rounded-full bg-blue-400/20 blur-3xl" />
        </div>

        {/* Glass content card — stitch: glass-sidebar rounded-xl shadow-sm border border-white/30 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 max-w-lg p-10 rounded-xl text-left"
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "0.5px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          {/* Logo — stitch: w-12 h-12 bg-primary rounded-lg icon + headline */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 7.28V5c0-1.1-.9-2-2-2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"/>
                <circle cx="16" cy="12" r="1.5"/>
              </svg>
            </div>
            <h1 className="text-[24px] font-black tracking-tight text-black">AssetFlow</h1>
          </div>

          {/* Headline */}
          <h2 className="text-[24px] font-semibold text-black mb-4 leading-tight tracking-tight">
            Empower your organization with intelligent asset management.
          </h2>
          <p className="text-[16px] text-on-surface-variant mb-8 leading-relaxed">
            Join thousands of enterprises optimizing their equipment lifecycle, maintenance
            schedules, and team productivity in one unified platform.
          </p>

          {/* Feature list — stitch: check icon in rounded bg-primary/10 circle */}
          <ul className="space-y-4">
            {[
              "Real-time inventory tracking",
              "Automated maintenance alerts",
              "Advanced team analytics",
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-black" />
                </div>
                <span className="text-[12px] font-medium text-on-surface">{feat}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* ── Right panel: white background, signup form ── */}
      {/* Stitch: w-full lg:w-1/2 bg-background flex flex-col justify-center items-center p-6 md:p-12 */}
      <section
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 overflow-y-auto relative"
        style={{ backgroundColor: "#f9f9f9" }}
      >
        <div className="w-full max-w-[420px] space-y-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 7.28V5c0-1.1-.9-2-2-2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"/>
                <circle cx="16" cy="12" r="1.5"/>
              </svg>
            </div>
            <span className="text-[18px] font-black text-black">AssetFlow</span>
          </div>

          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
            <h2 className="text-[24px] font-semibold text-on-surface tracking-tight leading-8 mb-2">
              Create your account
            </h2>
            <p className="text-[14px] text-on-surface-variant">
              Start your 14-day free trial. No credit card required.
            </p>
          </motion.div>

          {/* Success state */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center space-y-3"
            >
              <div className="flex justify-center">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <p className="text-on-surface font-semibold text-[16px]">Account created!</p>
              <p className="text-on-surface-variant text-[14px]">Redirecting you to sign in…</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-5">

              {/* Full Name — single field (stitch uses "Full Name" not split) */}
              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="text-[12px] font-medium text-on-surface block ml-1">
                    First Name
                  </label>
                  <div className="relative group">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      // Stitch: bg-surface-container-low border-transparent rounded-lg focus:outline-2 focus:outline-blue
                      className="w-full h-12 pl-10 pr-4 bg-surface-container-low border-transparent rounded-lg text-[14px] text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-black/20 focus:bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="text-[12px] font-medium text-on-surface block ml-1">
                    Last Name
                  </label>
                  <div className="relative group">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 bg-surface-container-low border-transparent rounded-lg text-[14px] text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-black/20 focus:bg-white"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Work Email */}
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="space-y-1.5">
                <label htmlFor="email" className="text-[12px] font-medium text-on-surface block ml-1">
                  Work Email
                </label>
                <div className="relative group">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="jane@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 pl-10 pr-4 bg-surface-container-low border-transparent rounded-lg text-[14px] text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-black/20 focus:bg-white"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="space-y-1.5">
                <label htmlFor="password" className="text-[12px] font-medium text-on-surface block ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-12 pl-10 pr-12 bg-surface-container-low border-transparent rounded-lg text-[14px] text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-black/20 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Strength indicator — stitch: 4 bar segments */}
                {password.length > 0 && (
                  <div className="pt-2">
                    <div className="flex gap-1.5 h-1 w-full mb-1">
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          className={`flex-1 rounded-full transition-colors duration-300 ${
                            seg <= Math.ceil((strength.score / 5) * 4)
                              ? strength.color
                              : "bg-surface-container-highest"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Security strength:{" "}
                      <span className={
                        strength.score <= 1 ? "text-red-500" :
                        strength.score <= 3 ? "text-amber-500" :
                        "text-emerald-600"
                      }>
                        {strength.label}
                      </span>
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Confirm password */}
              <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="space-y-1.5">
                <label htmlFor="confirm" className="text-[12px] font-medium text-on-surface block ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  <input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full h-12 pl-10 pr-12 bg-surface-container-low border-transparent rounded-lg text-[14px] text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-black/20 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirm.length > 0 && password !== confirm && (
                  <p className="text-[11px] text-error ml-1">Passwords do not match.</p>
                )}
              </motion.div>

              {/* Terms */}
              <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show">
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  By signing up, you agree to our{" "}
                  <a href="#" className="text-black font-bold underline hover:no-underline underline-offset-4">Terms</a>
                  {" "}and{" "}
                  <a href="#" className="text-black font-bold underline hover:no-underline underline-offset-4">Privacy Policy</a>.
                </p>
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

              {/* Submit — stitch: h-14 bg-primary text-on-primary rounded-lg */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 bg-black text-white rounded-lg flex items-center justify-center gap-2 text-[12px] font-medium hover:scale-[1.02] active:scale-[0.98] transition-all mt-2"
                style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account <ArrowRight size={14} />
                  </span>
                )}
              </motion.button>
            </form>
          )}

          {/* OR divider + social */}
          {!success && (
            <>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-container-highest" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-[11px] font-semibold text-on-surface-variant" style={{ backgroundColor: "#f9f9f9" }}>
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="h-12 border border-surface-container-highest rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors text-[12px] font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button className="h-12 border border-surface-container-highest rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors text-[12px] font-medium">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.403 22 12.017 22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub
                </button>
              </div>
            </>
          )}

          <div className="text-center pt-2">
            <p className="text-[14px] text-on-surface-variant">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-bold hover:underline underline-offset-4">
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative corner accents — stitch */}
        <div className="absolute top-0 right-0 p-8">
          <div className="w-24 h-24 border-t-2 border-r-2 border-black/5 rounded-tr-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 p-8">
          <div className="w-24 h-24 border-b-2 border-l-2 border-black/5 rounded-bl-3xl" />
        </div>
      </section>
    </main>
  );
}
