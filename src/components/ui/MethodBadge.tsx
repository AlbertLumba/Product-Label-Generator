// src/components/ui/MethodBadge.tsx

"use client";

import React from "react";

// ─────────────────────────────────────────────
// HTTP METHOD BADGE
// ─────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export interface MethodBadgeProps {
  method: HttpMethod;
}

const methodStyles: Record<HttpMethod, string> = {
  GET:     "bg-[#001F3A] text-[#5BA4F5] border-[#0A3A6A]",
  POST:    "bg-[var(--gw-fern-bg)] text-[var(--gw-fern-text)] border-[var(--gw-fern-dim)]",
  PUT:     "bg-[var(--gw-amber-bg)] text-[var(--gw-amber)] border-[var(--gw-amber-dim)]",
  PATCH:   "bg-[var(--gw-amber-bg)] text-[var(--gw-amber)] border-[var(--gw-amber-dim)]",
  DELETE:  "bg-[var(--gw-red-bg)] text-[var(--gw-red)] border-[var(--gw-red-dim)]",
  OPTIONS: "bg-[var(--gw-bg3)] text-[var(--gw-sub)] border-[var(--gw-border)]",
};

export const MethodBadge: React.FC<MethodBadgeProps> = ({ method }) => (
  <span
    className={`font-mono text-[10px] tracking-[0.1em] px-1.5 py-0.5 rounded-[3px] border ${methodStyles[method]}`}
  >
    {method}
  </span>
);