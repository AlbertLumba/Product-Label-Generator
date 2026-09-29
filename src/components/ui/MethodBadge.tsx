// src/components/ui/MethodBadge.tsx

"use client";

import React from "react";

// ─────────────────────────────────────────────
// STATUS BADGE — task lifecycle for daily review workflow
// ─────────────────────────────────────────────

export type TaskStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "BLOCKED"
  | "OVERDUE";

export interface MethodBadgeProps {
  status: TaskStatus;
}

const statusStyles: Record<TaskStatus, string> = {
  DRAFT:     "bg-[var(--gw-bg3)]       text-[var(--gw-muted)]     border-[var(--gw-border)]",
  SUBMITTED: "bg-[var(--gw-cyan-bg)]   text-[var(--gw-cyan)]      border-[var(--gw-cyan-dim)]",
  IN_REVIEW: "bg-[var(--gw-amber-bg)]  text-[var(--gw-amber)]     border-[var(--gw-amber-dim)]",
  APPROVED:  "bg-[var(--gw-fern-bg)]   text-[var(--gw-fern-text)] border-[var(--gw-fern-dim)]",
  REJECTED:  "bg-[var(--gw-red-bg)]    text-[var(--gw-red)]       border-[var(--gw-red-dim)]",
  BLOCKED:   "bg-[var(--gw-amber-bg)]  text-[var(--gw-amber)]     border-[var(--gw-amber-dim)]",
  OVERDUE:   "bg-[var(--gw-red-bg)]    text-[var(--gw-red)]       border-[var(--gw-red-dim)]",
};

const statusLabels: Record<TaskStatus, string> = {
  DRAFT:     "Draft",
  SUBMITTED: "Submitted",
  IN_REVIEW: "In Review",
  APPROVED:  "Approved",
  REJECTED:  "Rejected",
  BLOCKED:   "Blocked",
  OVERDUE:   "Overdue",
};

export const MethodBadge: React.FC<MethodBadgeProps> = ({ status }) => (
  <span
    className={`font-mono text-[10px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-[3px] border ${statusStyles[status]}`}
  >
    {statusLabels[status]}
  </span>
);

// Alias for clarity — same component, better name for the domain
export const StatusBadge = MethodBadge;