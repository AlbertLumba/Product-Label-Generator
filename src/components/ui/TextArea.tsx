// src/components/ui/TextArea.tsx

"use client";

import React, { forwardRef } from "react";

// ─────────────────────────────────────────────
// TEXTAREA
// ─────────────────────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  status?: "default" | "error";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, status = "default", className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--gw-sub)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full font-mono text-[14px] text-[var(--gw-text)] bg-[var(--gw-bg2)] border rounded-[4px] px-3 py-2.5 outline-none transition-all duration-150 resize-y min-h-[88px] leading-relaxed placeholder:text-[var(--gw-muted)] ${
            status === "error"
              ? "border-[var(--gw-red-dim)] focus:border-[var(--gw-red)] focus:shadow-[0_0_0_2px_rgba(200,75,75,0.12)]"
              : "border-[var(--gw-border)] focus:border-[var(--gw-fern)] focus:shadow-[0_0_0_2px_rgba(42,107,74,0.13)]"
          } ${className}`}
          {...props}
        />
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
Textarea.displayName = "Textarea";