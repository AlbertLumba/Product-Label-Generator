// src/components/ui/Input.tsx

"use client";

import React, { forwardRef } from "react";

// ─────────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────────

export type InputStatus = "default" | "error" | "success" | "key";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  status?: InputStatus;
  prefix?: string;
  suffix?: string;
  prefixNode?: React.ReactNode;
  suffixNode?: React.ReactNode;
}

const inputBase =
  "w-full font-mono text-[14px] bg-[var(--gw-bg2)] border rounded-[4px] px-3 py-2.5 outline-none transition-all duration-150 placeholder:text-[var(--gw-muted)]";

const inputStatuses: Record<InputStatus, string> = {
  default:
    "border-[var(--gw-border)] text-[var(--gw-text)] focus:border-[var(--gw-fern)] focus:shadow-[0_0_0_2px_rgba(42,107,74,0.13)]",
  error:
    "border-[var(--gw-red-dim)] text-[var(--gw-text)] focus:border-[var(--gw-red)] focus:shadow-[0_0_0_2px_rgba(200,75,75,0.12)]",
  success:
    "border-[var(--gw-fern-dim)] text-[var(--gw-text)] focus:border-[var(--gw-fern)] focus:shadow-[0_0_0_2px_rgba(42,107,74,0.13)]",
  key: "border-[var(--gw-fern-dim)] text-[var(--gw-fern-text)] bg-[var(--gw-fern-bg)] focus:border-[var(--gw-fern-hi)] focus:shadow-[0_0_0_2px_rgba(42,107,74,0.13)] tracking-[0.04em]",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      status = "default",
      prefix,
      suffix,
      prefixNode,
      suffixNode,
      className = "",
      ...props
    },
    ref
  ) => {
    const hasLeft = prefix || prefixNode;
    const hasRight = suffix || suffixNode;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--gw-sub)]">
            {label}
          </label>
        )}
        <div className="relative">
          {hasLeft && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-[var(--gw-muted)] pointer-events-none">
              {prefix || prefixNode}
            </span>
          )}
          <input
            ref={ref}
            className={`${inputBase} ${inputStatuses[status]} ${hasLeft ? "pl-[28px]" : ""} ${hasRight ? "pr-[52px]" : ""} ${className}`}
            {...props}
          />
          {hasRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-[var(--gw-muted)] pointer-events-none">
              {suffix || suffixNode}
            </span>
          )}
        </div>
        {hint && (
          <span
            className={`font-mono text-[11px] ${
              status === "error" ? "text-[var(--gw-red)]" : "text-[var(--gw-muted)]"
            }`}
          >
            {hint}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";