// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/groups/loading.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Skeleton } from "@/components/ui/Skeleton";

export default function GroupsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton width={40} height={40} rounded="lg" />
          <div className="flex flex-col gap-2">
            <Skeleton width={90} height={16} />
            <Skeleton width={140} height={12} />
          </div>
        </div>
        <Skeleton width={110} height={36} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <Skeleton width={32} height={32} rounded="lg" />
              <Skeleton width={110} height={14} />
            </div>
            <Skeleton width="80%" height={10} />
            <div className="flex gap-4 mt-2">
              <Skeleton width={90} height={10} />
              <Skeleton width={70} height={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}