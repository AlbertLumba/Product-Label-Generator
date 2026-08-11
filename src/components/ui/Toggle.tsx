// src/components/ui/Toggle.tsx

"use client";

import React from "react";

// ─────────────────────────────────────────────
// TOGGLE
// ─────────────────────────────────────────────

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div
      className={`flex items-center gap-2.5 ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={() => !disabled && onChange?.(!checked)}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => e.key === " " && !disabled && onChange?.(!checked)}
    >
      <div
        className={`relative w-9 h-5 rounded-[10px] border transition-all duration-200 flex-shrink-0 ${
          checked 
            ? "bg-[var(--gw-fern)] border-[var(--gw-fern-hi)]" 
            : "bg-[var(--gw-bg3)] border-[var(--gw-border)]"
        }`}
      >
        <div
          className={`absolute top-[3px] w-3.5 h-3.5 rounded-full transition-transform duration-200 shadow-sm ${
            checked 
              ? "translate-x-[18px] bg-white" 
              : "translate-x-[2px] bg-[var(--gw-sub)]"
          }`}
        />
      </div>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="font-mono text-[13px] text-[var(--gw-text)]">{label}</span>
          )}
          {description && (
            <span className="font-mono text-[11px] text-[var(--gw-muted)]">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};