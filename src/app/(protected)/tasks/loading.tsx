// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/tasks/loading.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Skeleton } from "@/components/ui/Skeleton";

export default function TasksLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton width={40} height={40} rounded="lg" />
          <div className="flex flex-col gap-2">
            <Skeleton width={120} height={16} />
            <Skeleton width={180} height={12} />
          </div>
        </div>
        <Skeleton width={110} height={36} />
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton width={50} height={10} />
            <Skeleton height={38} />
          </div>
        ))}
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl overflow-hidden divide-y divide-[var(--gw-border)]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton width={64} height={18} rounded="sm" />
                <Skeleton width={80} height={12} />
              </div>
              <Skeleton width="55%" height={14} />
              <Skeleton width="35%" height={10} />
            </div>
            <Skeleton width={90} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}