// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/components/layout/NavProgress.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      setProgress(15);
    });

    const t1 = setTimeout(() => setProgress(45), 80);
    const t2 = setTimeout(() => setProgress(75), 220);
    const t3 = setTimeout(() => setProgress(100), 400);
    const t4 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 620);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] pointer-events-none"
    >
      <div
        className="h-full bg-gw-fern shadow-[0_0_8px_rgba(42,107,74,0.6)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}