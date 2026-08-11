// src/components/ui/Divider.tsx

"use client";

import React from "react";

// ─────────────────────────────────────────────
// DIVIDER
// ─────────────────────────────────────────────

export interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className = "" }) => (
  <div className={`flex items-center gap-3 my-2 ${className}`}>
    <div className="flex-1 h-px bg-[var(--gw-border)]" />
    {label && (
      <span className="font-mono text-[11px] tracking-[0.1em] text-[var(--gw-muted)] uppercase">
        {label}
      </span>
    )}
    <div className="flex-1 h-px bg-[var(--gw-border)]" />
  </div>
);