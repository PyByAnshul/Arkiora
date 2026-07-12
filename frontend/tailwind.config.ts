/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Luminous Enterprise Design System ──────────────────────────────
        // Background / Canvas
        background: "#f9f9f9",
        canvas: "#E5E5E2",            // bone-white canvas (Level 0)

        // Surface layers
        surface: "#f9f9f9",
        "surface-dim": "#dadada",
        "surface-bright": "#f9f9f9",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f3f3",
        "surface-container": "#eeeeee",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "surface-variant": "#e2e2e2",
        "surface-tint": "#5e5e5e",

        // Text
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#4c4546",
        "on-background": "#1a1c1c",
        "inverse-surface": "#2f3131",
        "inverse-on-surface": "#f1f1f1",

        // Primary (black-based)
        primary: {
          DEFAULT: "#000000",
          container: "#1b1b1b",
          fixed: "#e2e2e2",
          "fixed-dim": "#c6c6c6",
        },
        "on-primary": "#ffffff",
        "on-primary-container": "#848484",
        "on-primary-fixed": "#1b1b1b",
        "on-primary-fixed-variant": "#474747",
        "inverse-primary": "#c6c6c6",

        // Secondary
        secondary: {
          DEFAULT: "#5e5e62",
          container: "#e0dfe3",
          fixed: "#e3e2e6",
          "fixed-dim": "#c7c6ca",
        },
        "on-secondary": "#ffffff",
        "on-secondary-container": "#626266",
        "on-secondary-fixed": "#1a1b1f",
        "on-secondary-fixed-variant": "#46464a",

        // Tertiary (same as primary in this system)
        tertiary: {
          DEFAULT: "#000000",
          container: "#1b1b1b",
          fixed: "#e2e2e2",
          "fixed-dim": "#c6c6c6",
        },
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#848484",
        "on-tertiary-fixed": "#1b1b1b",
        "on-tertiary-fixed-variant": "#474747",

        // Outline
        outline: "#7e7576",
        "outline-variant": "#cfc4c5",

        // Semantic
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        success: { DEFAULT: "#15803d", container: "#dcfce7" },
        warning: { DEFAULT: "#b45309", container: "#fef3c7" },
        info: { DEFAULT: "#1d4ed8", container: "#dbe1ff" },

        // Accent
        "accent-blue": "#2563eb",
      },

      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },

      fontSize: {
        // Luminous Enterprise scale
        "label-sm":  ["11px", { lineHeight: "14px", fontWeight: "600" }],
        "label-md":  ["12px", { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "500" }],
        "body-md":   ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm":   ["14px", { lineHeight: "20px" }],
        "body-lg":   ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-base": ["16px", { lineHeight: "24px" }],
        "title-sm":  ["18px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-md": ["18px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-lg":  ["36px", { lineHeight: "44px", fontWeight: "700" }],
        "display-xl":  ["56px", { lineHeight: "64px", fontWeight: "800" }],
      },

      borderRadius: {
        sm:      "4px",
        DEFAULT: "8px",
        md:      "12px",
        lg:      "16px",
        xl:      "24px",
        "2xl":   "32px",
        full:    "9999px",
      },

      spacing: {
        container: "24px",
        gutter:    "16px",
      },

      boxShadow: {
        // Luminous elevation model
        card:    "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)",
        ambient: "0px 20px 50px rgba(0,0,0,0.08)",
        modal:   "0 20px 50px rgba(0,0,0,0.14)",
        glass:   "inset 0 0.5px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.05)",
        glow:    "0 0 40px rgba(0,0,0,0.08)",
      },

      backdropBlur: {
        glass: "24px",
      },

      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%":   { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          "0%":   { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
        spin: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },

      animation: {
        "fade-in":       "fade-in 400ms ease-out both",
        "fade-in-up":    "fade-in-up 500ms ease-out both",
        "fade-in-down":  "fade-in-down 400ms ease-out both",
        "scale-in":      "scale-in 300ms ease-out both",
        "slide-in-left": "slide-in-left 400ms ease-out both",
        shimmer:         "shimmer 2s linear infinite",
        float:           "float 6s ease-in-out infinite",
        "pulse-soft":    "pulse-soft 2s ease-in-out infinite",
      },

      transitionTimingFunction: {
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
    },
  },
  plugins: [],
};

export default config;
