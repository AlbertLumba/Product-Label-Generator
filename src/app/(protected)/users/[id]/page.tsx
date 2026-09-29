// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/users/[id]/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { requireAdmin } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/api/server-fetch";
import { UserDetailClient } from "./components/UserDetailClient";
import type { ApiResponse } from "@/lib/api/types";

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  taskCount: number;
  groups: { id: string; name: string }[];
}

type Params = Promise<{ id: string }>;

export default async function UserDetailPage({ params }: { params: Params }) {
  await requireAdmin();
  const { id } = await params;

  const res = await serverFetch<ApiResponse<{ user: UserDetail }>>(
    `/api/users/${id}`
  );

  if (!res.data?.user) {
    return (
      <div className="px-5 py-16 text-center font-mono text-[13px] text-[var(--gw-sub)]">
        User not found
      </div>
    );
  }

  return <UserDetailClient user={res.data.user} />;
}