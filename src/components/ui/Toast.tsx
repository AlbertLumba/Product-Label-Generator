// src/components/ui/Toast.tsx

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string, duration?: number) => void;
  error: (title: string, description?: string, duration?: number) => void;
  warning: (title: string, description?: string, duration?: number) => void;
  info: (title: string, description?: string, duration?: number) => void;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 4500;

const VARIANTS: Record<
  ToastVariant,
  { wrap: string; title: string; progress: string; icon: React.ReactNode }
> = {
  success: {
    wrap: "bg-[var(--gw-fern-bg)] border-[var(--gw-fern-dim)]",
    title: "text-[var(--gw-fern-text)]",
    progress: "bg-[var(--gw-fern-text)]",
    icon: <CheckCircle2 size={14} className="text-[var(--gw-fern-text)]" />,
  },
  error: {
    wrap: "bg-[var(--gw-red-bg)] border-[var(--gw-red-dim)]",
    title: "text-[var(--gw-red)]",
    progress: "bg-[var(--gw-red)]",
    icon: <AlertCircle size={14} className="text-[var(--gw-red)]" />,
  },
  warning: {
    wrap: "bg-[var(--gw-amber-bg)] border-[var(--gw-amber-dim)]",
    title: "text-[var(--gw-amber)]",
    progress: "bg-[var(--gw-amber)]",
    icon: <AlertTriangle size={14} className="text-[var(--gw-amber)]" />,
  },
  info: {
    wrap: "bg-[var(--gw-cyan-bg)] border-[var(--gw-cyan-dim)]",
    title: "text-[var(--gw-cyan)]",
    progress: "bg-[var(--gw-cyan)]",
    icon: <Info size={14} className="text-[var(--gw-cyan)]" />,
  },
};

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
};

// ─────────────────────────────────────────────
// TOAST ITEM
// ─────────────────────────────────────────────

type DismissMode = "swipe" | "collapse";

interface ToastItemProps {
  toast: Toast;
  /** 0 = newest/foreground, higher = older/behind */
  stackIndex: number;
  onDismiss: (mode: DismissMode) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  stackIndex,
  onDismiss,
}) => {
  const v = VARIANTS[toast.variant];

  // ── Lifecycle state ──────────────────────────────
  const [phase, setPhase] = useState<
    "entering" | "idle" | "exiting-swipe" | "exiting-collapse"
  >("entering");

  // Progress bar (0–1, counts down from 1)
  const [progress, setProgress] = useState(1);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);
  const duration = toast.duration ?? DEFAULT_DURATION;
  const durationRef = useRef(duration);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // ── Enter animation ──────────────────────────────
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase("idle"));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // ── Progress timer ───────────────────────────────
  const tick = useCallback((now: number) => {
    if (pausedRef.current) {
      startRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const elapsed = elapsedRef.current + (now - (startRef.current ?? now));
    const pct = Math.max(0, 1 - elapsed / durationRef.current);
    setProgress(pct);
    if (elapsed >= durationRef.current) {
      setPhase("exiting-collapse");
    } else {
      startRef.current = now;
      elapsedRef.current = elapsed;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  useEffect(() => {
    if (phase !== "idle" || duration <= 0) return;
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, duration, tick]);

  // ── Exit triggers ────────────────────────────────
  useEffect(() => {
    if (phase === "exiting-swipe" || phase === "exiting-collapse") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const delay = phase === "exiting-swipe" ? 320 : 280;
      const t = setTimeout(
        () => onDismiss(phase === "exiting-swipe" ? "swipe" : "collapse"),
        delay,
      );
      return () => clearTimeout(t);
    }
  }, [phase, onDismiss]);

  const handleDismiss = () => setPhase("exiting-swipe");

  // ── Stack visual state (Top-Right positioning) ──
  const isExiting = phase === "exiting-swipe" || phase === "exiting-collapse";
  const isEntering = phase === "entering";

  const stackScale = isExiting ? 1 : Math.max(0.88, 1 - stackIndex * 0.03);
  const stackTranslX = isExiting ? 0 : stackIndex * -4;
  const stackTranslY = isExiting ? 0 : stackIndex * -3;
  const stackOpacity = isExiting ? 0 : Math.max(0.3, 1 - stackIndex * 0.15);

  const enterTranslX = isEntering ? 40 : 0;
  const enterScale = isEntering ? 0.96 : stackScale;
  const enterOpacity = isEntering ? 0 : stackOpacity;

  const exitTranslX = phase === "exiting-swipe" ? 60 : 0;
  const exitTranslY = phase === "exiting-swipe" ? 0 : stackTranslY;

  const transform = `translateX(${exitTranslX + enterTranslX + stackTranslX}px) translateY(${exitTranslY}px) scale(${enterScale})`;
  const opacity = enterOpacity;

  const maxH = isEntering
    ? "0px"
    : isExiting && phase === "exiting-collapse"
      ? "0px"
      : "120px";
  const mb = isEntering
    ? "0px"
    : isExiting && phase === "exiting-collapse"
      ? "0px"
      : "8px";

  const transition = isEntering
    ? "none"
    : phase === "exiting-swipe"
      ? "opacity 220ms ease, transform 220ms cubic-bezier(0.4,0,1,1), max-height 260ms ease 120ms, margin-bottom 260ms ease 120ms"
      : phase === "exiting-collapse"
        ? "opacity 180ms ease, max-height 240ms cubic-bezier(0.4,0,0.2,1), margin-bottom 240ms ease"
        : "opacity 280ms cubic-bezier(0.4,0,0.2,1), transform 300ms cubic-bezier(0.4,0,0.2,1), max-height 280ms cubic-bezier(0.4,0,0.2,1), margin-bottom 280ms cubic-bezier(0.4,0,0.2,1)";

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        transform,
        opacity,
        maxHeight: maxH,
        marginBottom: mb,
        overflow: "hidden",
        transition,
        willChange: "transform, opacity, max-height",
      }}
      className="w-[320px] relative cursor-pointer"
      onClick={handleDismiss}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
        startRef.current = performance.now();
      }}
    >
      {/* Card */}
      <div
        className={`flex gap-2.5 items-start px-3.5 py-3 border rounded-[4px] ${v.wrap}`}
      >
        <span className="flex-shrink-0 mt-[1px]">{v.icon}</span>

        <div className="flex-1 min-w-0">
          <p
            className={`font-mono text-[11px] tracking-[0.1em] uppercase mb-0.5 ${v.title}`}
          >
            {toast.title}
          </p>
          {toast.description && (
            <p className="font-mono text-[12px] text-[var(--gw-sub)] leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>

        <button
          className="flex-shrink-0 bg-transparent border-none cursor-pointer text-[var(--gw-muted)] hover:text-[var(--gw-text)] transition-colors duration-150 leading-none"
          aria-label="Dismiss notification"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
        >
          <X size={12} />
        </button>

        {/* Progress bar */}
        {duration > 0 && (
          <div
            className={`absolute bottom-0 left-0 h-[2px] rounded-bl-[4px] ${v.progress} transition-none`}
            style={{ width: `${progress * 100}%`, transitionProperty: "none" }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => {
      const next =
        prev.length >= MAX_TOASTS ? prev.slice(0, MAX_TOASTS - 1) : prev;
      return [{ ...toast, id }, ...next];
    });
  }, []);

  const success = useCallback(
    (title: string, description?: string, duration = DEFAULT_DURATION) =>
      addToast({ title, description, variant: "success", duration }),
    [addToast],
  );
  const error = useCallback(
    (title: string, description?: string, duration = DEFAULT_DURATION) =>
      addToast({ title, description, variant: "error", duration }),
    [addToast],
  );
  const warning = useCallback(
    (title: string, description?: string, duration = DEFAULT_DURATION) =>
      addToast({ title, description, variant: "warning", duration }),
    [addToast],
  );
  const info = useCallback(
    (title: string, description?: string, duration = DEFAULT_DURATION) =>
      addToast({ title, description, variant: "info", duration }),
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{ addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// ─────────────────────────────────────────────
// CONTAINER
// ─────────────────────────────────────────────

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => (
  <div
    role="region"
    aria-label="Notifications"
    aria-live="polite"
    className="fixed top-5 right-5 z-[200] flex flex-col items-end gap-0"
  >
    {toasts.map((toast, i) => (
      <ToastItem
        key={toast.id}
        toast={toast}
        stackIndex={i}
        onDismiss={() => onRemove(toast.id)}
      />
    ))}
  </div>
);
