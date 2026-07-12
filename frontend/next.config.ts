import type { NextConfig } from "next";
import reticleNext from "@reticlehq/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lint is run separately; don't fail production builds on style rules.
  eslint: { ignoreDuringBuilds: true },
  // No rewrites needed — the frontend uses NEXT_PUBLIC_API_BASE to call the backend
  // directly (e.g. http://localhost:8000). Next.js App Router would intercept
  // /api/* rewrites as page routes before proxying them, causing 404s.
};

export default reticleNext.withReticle(nextConfig);
