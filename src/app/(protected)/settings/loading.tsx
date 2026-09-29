// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/settings/loading.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-3xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded="lg" />
        <div className="flex flex-col gap-2">
          <Skeleton width={90} height={16} />
          <Skeleton width={160} height={12} />
        </div>
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-5 flex items-center gap-4">
        <Skeleton width={48} height={48} rounded="full" />
        <div className="flex flex-col gap-2">
          <Skeleton width={140} height={14} />
          <Skeleton width={180} height={11} />
        </div>
      </div>

      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-5 flex flex-col gap-4"
        >
          <Skeleton width={80} height={12} />
          {Array.from({ length: i === 0 ? 2 : 3 }).map((_, j) => (
            <div key={j} className="flex flex-col gap-2">
              <Skeleton width={70} height={10} />
              <Skeleton height={38} />
            </div>
          ))}
          <div className="flex justify-end">
            <Skeleton width={120} height={32} />
          </div>
        </div>
      ))}
    </div>
  );
}