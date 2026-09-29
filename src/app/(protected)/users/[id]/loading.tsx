// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/users/[id]/loading.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Skeleton } from "@/components/ui/Skeleton";

export default function UserDetailLoading() {
  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Skeleton width={32} height={32} rounded="lg" />
        <div className="flex flex-col gap-2">
          <Skeleton width={140} height={18} />
          <Skeleton width={90} height={12} />
        </div>
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-5 flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton width={60} height={10} />
            <Skeleton height={38} />
          </div>
        ))}
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-5 grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton width={60} height={10} />
            <Skeleton width={120} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}