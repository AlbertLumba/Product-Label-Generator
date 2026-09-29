// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/activity/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { requireUser } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/api/server-fetch";
import { ActivityClient } from "./components/ActivityClient";
import type { ApiResponse } from "@/lib/api/types";

export interface ActivityRow {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string; role: "ADMIN" | "USER" };
  task: { id: string; title: string };
}

interface ActivityListResponse {
  activity: ActivityRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default async function ActivityPage() {
  const user = await requireUser();

  const res = await serverFetch<ApiResponse<ActivityListResponse>>(
    "/api/activity"
  );

  return (
    <ActivityClient
      initial={res.data ?? null}
      isAdmin={user.role === "ADMIN"}
    />
  );
}