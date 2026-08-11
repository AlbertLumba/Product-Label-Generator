// src/components/ui/IconButton.tsx

"use client";

import React, { forwardRef } from "react";
import type { ButtonVariant, ButtonSize } from "./Button";

// ─────────────────────────────────────────────
// ICON BUTTON
// ─────────────────────────────────────────────

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  "aria-label": string;
}

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 font-mono tracking-wide border transition-all duration-150 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-[4px]";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--gw-fern)] border-[var(--gw-fern-hi)] text-white hover:bg-[var(--gw-fern-hi)]",
  outline:
    "bg-transparent border-[var(--gw-border-hi)] text-[var(--gw-sub)] hover:border-[var(--gw-fern)] hover:text-[var(--gw-fern-text)] hover:bg-[rgba(42,107,74,0.13)]",
  ghost:
    "bg-transparent border-transparent text-[var(--gw-sub)] hover:text-[var(--gw-text)] hover:bg-[var(--gw-bg3)]",
  danger: "bg-transparent border-[var(--gw-red-dim)] text-[var(--gw-red)] hover:bg-[var(--gw-red-bg)]",
  cyan: "bg-transparent border-[var(--gw-cyan-dim)] text-[var(--gw-cyan)] hover:bg-[var(--gw-cyan-bg)]",
};

const padSizes: Record<ButtonSize, string> = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "outline", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${buttonBase} ${buttonVariants[variant]} ${padSizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";