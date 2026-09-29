// src/components/ui/Card.tsx

"use client";

import React from "react";

// ─────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────

export type CardAccent = "none" | "green" | "cyan" | "amber" | "red" | "muted";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Left-edge accent stripe — useful for task status */
  accent?: CardAccent;
  /** Subtle ring, e.g. when a lead has the task open */
  active?: boolean;
}

const accentStyles: Record<CardAccent, string> = {
  none:  "",
  green: "border-l-2 border-l-[var(--gw-fern)]",
  cyan:  "border-l-2 border-l-[var(--gw-cyan)]",
  amber: "border-l-2 border-l-[var(--gw-amber)]",
  red:   "border-l-2 border-l-[var(--gw-red)]",
  muted: "border-l-2 border-l-[var(--gw-border-hi)]",
};

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  accent = "none",
  active = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl
        ${accentStyles[accent]}
        ${active ? "ring-1 ring-[var(--gw-amber-dim)]" : ""}
        ${onClick ? "cursor-pointer transition-colors duration-150 hover:border-[var(--gw-border-hi)] hover:bg-[var(--gw-bg2)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};