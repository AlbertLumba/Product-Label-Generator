// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/groups/[id]/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { requireUser } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/api/server-fetch";
import { GroupDetailClient } from "./components/GroupDetailClient";
import type { ApiResponse } from "@/lib/api/types";

export interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  members: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
  }[];
  tasks: {
    id: string;
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    isReviewed: boolean;
    authorName: string;
    createdAt: string;
  }[];
}

type Params = Promise<{ id: string }>;

export default async function GroupDetailPage({
  params,
}: {
  params: Params;
}) {
  const user = await requireUser();
  const { id } = await params;

  const res = await serverFetch<ApiResponse<{ group: GroupDetail }>>(
    `/api/groups/${id}`
  );

  if (!res.data?.group) {
    return (
      <div className="px-5 py-16 text-center font-mono text-[13px] text-[var(--gw-sub)]">
        Group not found
      </div>
    );
  }

  return (
    <GroupDetailClient
      group={res.data.group}
      isAdmin={user.role === "ADMIN"}
    />
  );
}