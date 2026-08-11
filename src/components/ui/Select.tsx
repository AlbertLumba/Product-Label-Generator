// src/components/ui/Select.tsx

"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

// ─────────────────────────────────────────────
// SELECT
// ─────────────────────────────────────────────

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, options, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--gw-sub)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full font-mono text-[13px] text-[var(--gw-text)] bg-[var(--gw-bg2)] border border-[var(--gw-border)] rounded-[4px] px-3 py-2.5 pr-8 outline-none appearance-none cursor-pointer transition-all duration-150 focus:border-[var(--gw-fern)] focus:shadow-[0_0_0_2px_rgba(42,107,74,0.13)] ${className}`}
            {...props}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gw-muted)] pointer-events-none"
          />
        </div>
        {hint && (
          <span className="font-mono text-[11px] text-[var(--gw-muted)]">{hint}</span>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";