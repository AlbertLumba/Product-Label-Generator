// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/groups/[id]/loading.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Skeleton } from "@/components/ui/Skeleton";

export default function GroupDetailLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Skeleton width={32} height={32} rounded="lg" />
        <div className="flex flex-col gap-2">
          <Skeleton width={180} height={18} />
          <Skeleton width={240} height={12} />
        </div>
      </div>

      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-5 flex flex-col gap-4"
        >
          <Skeleton width={110} height={12} />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex items-center gap-3">
              <Skeleton width={28} height={28} rounded="full" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton width="50%" height={12} />
                <Skeleton width="30%" height={10} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}