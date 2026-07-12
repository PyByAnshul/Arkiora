import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lint is run separately; don't fail production builds on style rules.
  eslint: { ignoreDuringBuilds: true },
  // Proxy API calls to the backend in dev so the browser can use same-origin "/api/*".
  async rewrites() {
    if (!API_BASE) return [];
    return [{ source: "/api/:path*", destination: `${API_BASE}/api/:path*` }];
  },
};

export default nextConfig;
