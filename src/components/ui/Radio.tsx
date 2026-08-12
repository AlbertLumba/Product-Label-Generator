// src/components/ui/Radio.tsx

"use client";

import React, { forwardRef } from "react";

// ─────────────────────────────────────────────
// RADIO
// ─────────────────────────────────────────────

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, ...props }, ref) => {
    return (
      <label className="flex items-start gap-2 cursor-pointer group">
        <div className="relative flex-shrink-0 mt-0.5">
          <input ref={ref} type="radio" className="sr-only peer" {...props} />
          <div className="w-3.5 h-3.5 border border-[var(--gw-border)] rounded-full bg-[var(--gw-bg2)] transition-all duration-150 peer-checked:bg-[var(--gw-fern)] peer-checked:border-[var(--gw-fern-hi)] peer-checked:shadow-[inset_0_0_0_3px_var(--gw-bg2)] group-hover:border-[var(--gw-border-hi)]" />
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
Radio.displayName = "Radio";