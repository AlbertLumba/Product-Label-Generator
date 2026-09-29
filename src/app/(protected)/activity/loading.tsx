// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/activity/loading.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Skeleton } from "@/components/ui/Skeleton";

export default function ActivityLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded="lg" />
        <div className="flex flex-col gap-2">
          <Skeleton width={100} height={16} />
          <Skeleton width={180} height={12} />
        </div>
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4">
        <Skeleton height={38} width={220} />
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl overflow-hidden divide-y divide-[var(--gw-border)]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <Skeleton width={32} height={32} rounded="full" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton width="55%" height={12} />
              <Skeleton width="70%" height={10} />
            </div>
            <Skeleton width={110} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}