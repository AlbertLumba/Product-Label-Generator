// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/groups/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { requireUser } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/api/server-fetch";
import { GroupsClient } from "./components/GroupsClient";
import type { ApiResponse } from "@/lib/api/types";

export interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  taskCount: number;
}

interface GroupsListResponse {
  groups: GroupRow[];
}

export default async function GroupsPage() {
  const user = await requireUser();

  const res = await serverFetch<ApiResponse<GroupsListResponse>>(
    user.role === "ADMIN" ? "/api/groups" : "/api/groups?mine=true"
  );

  return (
    <GroupsClient
      initial={res.data?.groups ?? []}
      isAdmin={user.role === "ADMIN"}
    />
  );
}