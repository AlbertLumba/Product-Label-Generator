// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/tasks/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { serverFetch } from "@/lib/api/server-fetch";
import { TasksClient } from "./components/TasksClient";
import type { ApiResponse } from "@/lib/api/types";

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  author: { id: string; name: string; email: string };
  group: { id: string; name: string } | null;
  reviewedBy: { id: string; name: string } | null;
  reviewedAt: string | null;
  isReviewed: boolean;
  commentsCount: number;
}

export interface TasksListResponse {
  tasks: TaskRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface GroupOption {
  id: string;
  name: string;
}

// Next.js 15: searchParams is a Promise
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams; // ← await here

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp ?? {})) {
    if (typeof v === "string") qs.set(k, v);
    else if (Array.isArray(v) && v[0]) qs.set(k, v[0]);
  }
  if (!qs.has("scope")) qs.set("scope", "mine");

  const [tasksRes, groupsRes] = await Promise.all([
    serverFetch<ApiResponse<TasksListResponse>>(
      `/api/tasks?${qs.toString()}`
    ),
    serverFetch<ApiResponse<{ groups: GroupOption[] }>>(
      "/api/groups?mine=true"
    ),
  ]);

  return (
    <TasksClient
      initial={tasksRes.data ?? null}
      groups={groupsRes.data?.groups ?? []}
    />
  );
}