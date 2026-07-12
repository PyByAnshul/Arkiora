"use client";

import { useEffect } from "react";

// Dev-only Reticle instrumentation. The SDK is dynamically imported so it is
// fully tree-shaken out of production bundles (import.meta.env.DEV is false in prod).
// No-op in production — safe to leave in the layout.
export function ReticleClient() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    let cancelled = false;
    (async () => {
      const { install } = await import("@reticlehq/react");
      const { reticle } = await import("@reticlehq/browser");
      if (cancelled) return;
      install();
      reticle.connect({
        projectId: "assetflow-frontend-cc3f0238",
        token: process.env.NEXT_PUBLIC_RETICLE_TOKEN,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
