/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // AssetFlow design system (from Stitch "AssetFlow Design System").
        background: "#faf8ff",
        surface: "#ffffff",
        "surface-container": "#ededf9",
        "surface-container-low": "#f3f3fe",
        "surface-container-high": "#e7e7f3",
        outline: "#c3c6d7",
        "outline-strong": "#737686",
        "on-surface": "#191b23",
        "on-surface-variant": "#434655",
        primary: {
          DEFAULT: "#2563eb",
          deep: "#004ac6",
          container: "#2563eb",
          "on-container": "#eeefff",
        },
        secondary: { DEFAULT: "#505f76", container: "#d0e1fb" },
        error: { DEFAULT: "#ba1a1a", container: "#ffdad6" },
        success: { DEFAULT: "#15803d", container: "#dcfce7" },
        warning: { DEFAULT: "#b45309", container: "#fef3c7" },
        info: { DEFAULT: "#1d4ed8", container: "#dbe1ff" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em" }],
        "body-sm": ["14px", { lineHeight: "20px" }],
        "body-base": ["16px", { lineHeight: "24px" }],
        "title-sm": ["18px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "display-lg": ["36px", { lineHeight: "44px", fontWeight: "700" }],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "16px",
        full: "9999px",
      },
      spacing: {
        container: "24px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
        modal: "0 20px 48px -12px rgba(0,0,0,0.25)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
