// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/tasks/new/loading.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Skeleton } from "@/components/ui/Skeleton";

export default function NewTaskLoading() {
  return (
    <div className="max-w-3xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Skeleton width={32} height={32} rounded="lg" />
        <div className="flex flex-col gap-2">
          <Skeleton width={100} height={16} />
          <Skeleton width={160} height={12} />
        </div>
      </div>

      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton width={40} height={10} />
          <Skeleton height={38} />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton width={80} height={10} />
          <Skeleton height={110} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton width={60} height={10} />
            <Skeleton height={38} />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton width={70} height={10} />
            <Skeleton height={38} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--gw-border)]">
          <Skeleton width={80} height={32} />
          <Skeleton width={110} height={32} />
        </div>
      </div>
    </div>
  );
}