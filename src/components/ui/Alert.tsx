// src/components/ui/Alert.tsx

"use client";

import React from "react";

export type AlertVariant = "success" | "warning" | "error" | "info";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const alertVariants: Record<AlertVariant, { wrap: string; title: string; icon: string }> = {
  success: {
    wrap:  "bg-[var(--gw-fern-bg)] border-[var(--gw-fern-dim)]",
    title: "text-[var(--gw-fern-text)]",
    icon:  "text-[var(--gw-fern-text)]",
  },
  warning: {
    wrap:  "bg-[var(--gw-amber-bg)] border-[var(--gw-amber-dim)]",
    title: "text-[var(--gw-amber)]",
    icon:  "text-[var(--gw-amber)]",
  },
  error: {
    wrap:  "bg-[var(--gw-red-bg)] border-[var(--gw-red-dim)]",
    title: "text-[var(--gw-red)]",
    icon:  "text-[var(--gw-red)]",
  },
  info: {
    wrap:  "bg-[var(--gw-cyan-bg)] border-[var(--gw-cyan-dim)]",
    title: "text-[var(--gw-cyan)]",
    icon:  "text-[var(--gw-cyan)]",
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  icon,
  onDismiss,
  className = "",
}) => {
  const v = alertVariants[variant];
  return (
    <div
      className={`flex gap-2.5 items-start px-3.5 py-3 border rounded-[4px] ${v.wrap} ${className}`}
    >
      {icon && (
        <span className={`flex-shrink-0 mt-[1px] text-[16px] ${v.icon}`}>{icon}</span>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <div className={`font-mono text-[11px] tracking-[0.1em] uppercase mb-0.5 ${v.title}`}>
            {title}
          </div>
        )}
        <div className="text-[13px] text-[var(--gw-sub)] leading-relaxed">
          {children}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-[var(--gw-muted)] hover:text-[var(--gw-text)] transition-colors duration-150 cursor-pointer bg-transparent border-none"
        >
          ✕
        </button>
      )}
    </div>
  );
};