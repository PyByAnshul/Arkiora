import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size    = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:   "bg-black text-white hover:bg-zinc-800 shadow-sm active:scale-[0.98]",
  secondary: "bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant active:scale-[0.98]",
  ghost:     "text-on-surface-variant hover:bg-surface-container hover:text-on-surface active:scale-[0.98]",
  danger:    "bg-error text-white hover:bg-error/90 shadow-sm active:scale-[0.98]",
  outline:   "border border-outline-variant text-on-surface hover:bg-surface-container-low active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-8  px-3   text-label-md gap-1.5 rounded-lg",
  md: "h-10 px-4   text-body-md  gap-2   rounded-xl",
  lg: "h-12 px-6   text-body-lg  gap-2   rounded-xl",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-1",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {loading ? (
        <>
          <span className={cn(
            "border-2 border-current/30 border-t-current rounded-full animate-spin flex-shrink-0",
            size === "sm" ? "w-3 h-3" : "w-4 h-4"
          )} />
          {children}
        </>
      ) : children}
    </motion.button>
  );
}
