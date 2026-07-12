"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/shared/store/auth.store";
import { authApi } from "@/shared/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await authApi.login(email, password);
      setTokens({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
      const me = await authApi.me();
      setUser(me);
      router.replace("/assets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-md animate-fade-in-up p-8 shadow-modal">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
          <span className="text-headline-md font-bold">A</span>
        </div>
        <div>
          <div className="text-title-sm font-semibold text-on-surface">AssetFlow</div>
          <div className="text-label-md text-on-surface-variant">Enterprise Asset Management</div>
        </div>
      </div>

      <h1 className="mb-1 text-headline-md font-semibold text-on-surface">Sign in</h1>
      <p className="mb-6 text-body-sm text-on-surface-variant">Access your asset workspace.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label-text mb-1 block">Email</label>
          <input
            type="email"
            autoComplete="username"
            className="input-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label-text mb-1 block">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            className="input-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="rounded border border-error/30 bg-error-container px-3 py-2 text-body-sm text-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center rounded bg-primary text-body-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-deep disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
