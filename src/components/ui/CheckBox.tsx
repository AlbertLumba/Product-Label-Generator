// src/components/ui/CheckBox.tsx

"use client";

import React, { forwardRef } from "react";
import { Check } from "lucide-react";

// ─────────────────────────────────────────────
// CHECKBOX
// ─────────────────────────────────────────────

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = "", ...props }, ref) => {
    return (
      <label className="flex items-start gap-2 cursor-pointer group">
        <div className="relative flex-shrink-0 mt-0.5">
          <input ref={ref} type="checkbox" className="sr-only peer" {...props} />
          <div className="w-3.5 h-3.5 border border-[var(--gw-border)] rounded-[2px] bg-[var(--gw-bg2)] transition-all duration-150 peer-checked:bg-[var(--gw-fern)] peer-checked:border-[var(--gw-fern-hi)] group-hover:border-[var(--gw-border-hi)]" />
          <Check
            size={9}
            strokeWidth={2.5}
            className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-150 pointer-events-none"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="font-mono text-[13px] text-[var(--gw-sub)] group-hover:text-[var(--gw-text)] transition-colors duration-150">
              {label}
            </span>
          )}
          {description && (
            <span className="font-mono text-[11px] text-[var(--gw-muted)]">{description}</span>
          )}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";