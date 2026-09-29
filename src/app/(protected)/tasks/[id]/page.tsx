// src/app/(protected)/tasks/[id]/page.tsx

import { serverFetch } from "@/lib/api/server-fetch";
import { TaskDetailClient } from "./components/TaskDetailClient";
import type { ApiResponse } from "@/lib/api/types";

export interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; email: string; role: string };
  group: { id: string; name: string } | null;
  reviewedBy: { id: string; name: string } | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  isReviewed: boolean;
  comments: {
    id: string;
    body: string;
    createdAt: string;
    author: { id: string; name: string; role: string };
  }[];
  activityLogs: {
    id: string;
    action: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    actor: { id: string; name: string; role: string };
  }[];
}

type Params = Promise<{ id: string }>;

export default async function TaskDetailPage({ params }: { params: Params }) {
  const { id } = await params; // ← await

  const res = await serverFetch<ApiResponse<{ task: TaskDetail }>>(
    `/api/tasks/${id}`,
  );

  if (!res.data?.task) {
    return (
      <div className="px-5 py-16 text-center font-mono text-[13px] text-[var(--gw-sub)]">
        Task not found
      </div>
    );
  }

  return <TaskDetailClient task={res.data.task} />;
}
