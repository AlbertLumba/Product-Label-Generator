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
  green:   "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  cyan:    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800",
  amber:   "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  red:     "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  muted:   "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  outline: "bg-transparent text-gray-600 border-gray-300 dark:text-gray-400 dark:border-gray-600",
};

const dotColors: Record<BadgeVariant, string> = {
  green:   "bg-green-600 dark:bg-green-400",
  cyan:    "bg-cyan-600 dark:bg-cyan-400",
  amber:   "bg-amber-600 dark:bg-amber-400",
  red:     "bg-red-600 dark:bg-red-400",
  muted:   "bg-gray-400 dark:bg-gray-500",
  outline: "bg-gray-400 dark:bg-gray-500",
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