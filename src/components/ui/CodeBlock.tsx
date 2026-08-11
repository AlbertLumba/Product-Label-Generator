// src/components/ui/CodeBlock.tsx

"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

// ─────────────────────────────────────────────
// CODE BLOCK
// ─────────────────────────────────────────────

export interface CodeBlockProps {
  title?: string;
  language?: string;
  children: string;
  onCopy?: () => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  title,
  language = "bash",
  children,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between bg-[var(--gw-bg2)] border border-b-0 border-[var(--gw-border)] rounded-t-[4px] px-3.5 py-2">
          <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--gw-muted)]">
            {title}
          </span>
          <button
            onClick={handleCopy}
            className="font-mono text-[11px] text-[var(--gw-muted)] hover:text-[var(--gw-fern-text)] transition-colors duration-150 cursor-pointer bg-transparent border-none flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check size={11} /> Copied
              </>
            ) : (
              "Copy"
            )}
          </button>
        </div>
      )}
      <pre
        className={`bg-[var(--gw-bg)] border border-[var(--gw-border)] ${
          title ? "rounded-b-[4px]" : "rounded-[4px]"
        } px-4 py-3.5 font-mono text-[12px] text-[var(--gw-sub)] overflow-x-auto leading-relaxed`}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
};