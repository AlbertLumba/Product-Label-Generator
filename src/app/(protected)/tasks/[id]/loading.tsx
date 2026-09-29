// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/tasks/[id]/loading.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function TaskDetailLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton width={32} height={32} rounded="lg" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton width={70} height={18} rounded="sm" />
              <Skeleton width={80} height={12} />
            </div>
            <Skeleton width={260} height={18} />
          </div>
        </div>
        <Skeleton width={90} height={32} />
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton width={60} height={10} />
              <Skeleton width={100} height={14} />
            </div>
          ))}
        </div>
        <SkeletonText lines={3} />
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-5 flex flex-col gap-4">
        <Skeleton width={110} height={12} />
        <Skeleton height={80} />
        <div className="flex justify-end">
          <Skeleton width={100} height={32} />
        </div>
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-5 flex flex-col gap-4">
        <Skeleton width={130} height={12} />
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--gw-bg2)] border border-[var(--gw-border)] rounded-[4px] p-3 flex flex-col gap-2"
          >
            <Skeleton width="30%" height={12} />
            <SkeletonText lines={2} />
          </div>
        ))}
        <Skeleton height={70} />
      </div>
    </div>
  );
}