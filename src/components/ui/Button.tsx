// src/components/ui/Button.tsx

"use client";

import React, { forwardRef } from "react";

// ─────────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────────

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "cyan";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 font-mono tracking-wide border transition-all duration-150 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-[4px]";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--gw-fern)] border-[var(--gw-fern-hi)] text-white hover:bg-[var(--gw-fern-hi)]",
  outline:
    "bg-transparent border-[var(--gw-border-hi)] text-[var(--gw-sub)] hover:border-[var(--gw-fern)] hover:text-[var(--gw-fern-text)] hover:bg-[rgba(42,107,74,0.13)]",
  ghost:
    "bg-transparent border-transparent text-[var(--gw-sub)] hover:text-[var(--gw-text)] hover:bg-[var(--gw-bg3)]",
  danger:
    "bg-transparent border-[var(--gw-red-dim)] text-[var(--gw-red)] hover:bg-[var(--gw-red-bg)]",
  cyan:
    "bg-transparent border-[var(--gw-cyan-dim)] text-[var(--gw-cyan)] hover:bg-[var(--gw-cyan-bg)]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "text-[12px] px-3.5 py-1.5",
  md: "text-[13px] px-5 py-2.5",
  lg: "text-[14px] px-7 py-3",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        )}
        {!loading && icon && iconPosition === "left" && icon}
        {children}
        {!loading && icon && iconPosition === "right" && icon}
      </button>
    );
  }
);
Button.displayName = "Button";