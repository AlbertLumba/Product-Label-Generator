// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/dashboard/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { serverFetch } from "@/lib/api/server-fetch";
import { DashboardClient } from "./components/DashboardClient";
import type { ApiResponse } from "@/lib/api/types";

export interface DashboardData {
  stats: {
    totalTasks: number;
    reviewedTasks: number;
    pendingReview: number;
    overdueTasks: number;
    totalGroups: number;
    totalUsers: number;
    priorityStats: Record<string, number>;
  };
  pendingReviewTasks: {
    id: string;
    title: string;
    priority: string;
    dueDate: string | null;
    createdAt: string;
    author: { id: string; name: string; email: string };
    group: { id: string; name: string } | null;
    commentsCount: number;
    activityCount: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    createdAt: string;
    actor: { id: string; name: string; role: string };
    task: { id: string; title: string };
  }[];
  recentTasks: {
    id: string;
    title: string;
    priority: string;
    dueDate: string | null;
    createdAt: string;
    author: { id: string; name: string; email: string };
    group: { id: string; name: string } | null;
    reviewedBy: { id: string; name: string } | null;
    reviewedAt: string | null;
    isReviewed: boolean;
    commentsCount: number;
    activityCount: number;
  }[];
  groupTaskCounts: {
    id: string;
    name: string;
    taskCount: number;
    memberCount: number;
  }[];
  monthlyData: Record<string, number>;
}

export default async function DashboardPage() {
  const res = await serverFetch<ApiResponse<DashboardData>>("/api/dashboard");
  const data = res.data;

  if (!data) {
    return <div>Failed to load dashboard</div>;
  }

  return <DashboardClient data={data} />;
}