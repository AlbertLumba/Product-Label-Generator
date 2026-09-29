// src/components/ui/Badge.tsx

"use client";

import React from "react";

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────

export type BadgeVariant = "green" | "cyan" | "amber" | "red" | "muted" | "outline";

export interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  green:   "bg-[var(--gw-fern-bg)] text-[var(--gw-fern-text)] border-[var(--gw-fern-dim)]",
  cyan:    "bg-[var(--gw-cyan-bg)] text-[var(--gw-cyan)] border-[var(--gw-cyan-dim)]",
  amber:   "bg-[var(--gw-amber-bg)] text-[var(--gw-amber)] border-[var(--gw-amber-dim)]",
  red:     "bg-[var(--gw-red-bg)] text-[var(--gw-red)] border-[var(--gw-red-dim)]",
  muted:   "bg-[var(--gw-bg3)] text-[var(--gw-muted)] border-[var(--gw-border)]",
  outline: "bg-transparent text-[var(--gw-sub)] border-[var(--gw-border-hi)]",
};

const dotColors: Record<BadgeVariant, string> = {
  green:   "bg-[var(--gw-fern-text)]",
  cyan:    "bg-[var(--gw-cyan)]",
  amber:   "bg-[var(--gw-amber)]",
  red:     "bg-[var(--gw-red)]",
  muted:   "bg-[var(--gw-muted)]",
  outline: "bg-[var(--gw-muted)]",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "muted",
  dot = true,
  children,
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-[3px] border ${badgeVariants[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};