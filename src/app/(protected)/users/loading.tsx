// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/users/loading.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Skeleton } from "@/components/ui/Skeleton";

export default function UsersLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton width={40} height={40} rounded="lg" />
          <div className="flex flex-col gap-2">
            <Skeleton width={80} height={16} />
            <Skeleton width={160} height={12} />
          </div>
        </div>
        <Skeleton width={110} height={36} />
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Skeleton height={38} />
        <Skeleton height={38} />
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl overflow-hidden divide-y divide-[var(--gw-border)]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <Skeleton width={36} height={36} rounded="full" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton width="30%" height={14} />
              <Skeleton width="55%" height={10} />
            </div>
            <Skeleton width={60} height={20} />
          </div>
        ))}
      </div>
    </div>
  );
}