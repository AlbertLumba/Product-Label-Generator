// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/dashboard/loading.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded="lg" />
        <div className="flex flex-col gap-2">
          <Skeleton width={140} height={16} />
          <Skeleton width={200} height={12} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4 flex flex-col gap-3"
          >
            <Skeleton width={80} height={10} />
            <Skeleton width={60} height={24} />
            <Skeleton width={100} height={10} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-2xl p-5 flex flex-col gap-4"
          >
            <Skeleton width={120} height={14} />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton width={32} height={32} rounded="full" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton width="60%" height={12} />
                  <Skeleton width="40%" height={10} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}