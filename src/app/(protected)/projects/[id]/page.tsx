// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/projects/[id]/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { requireUser } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/api/server-fetch";
import { ProjectDetailClient } from "./components/ProjectDetailClient";
import type { ApiResponse } from "@/lib/api/types";

export interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  lead: { id: string; name: string; email: string } | null;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  group: {
    id: string;
    name: string;
    leader: { id: string; name: string } | null;
  };
  members: {
    id: string;
    name: string;
    email: string;
    userRole: "ADMIN" | "USER";
    groupRole: string;
  }[];
  tasks: {
    id: string;
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    isReviewed: boolean;
    authorName: string;
    assignee: { id: string; name: string } | null;
    createdAt: string;
  }[];
}

type Params = Promise<{ id: string }>;

export default async function ProjectDetailPage({
  params,
}: {
  params: Params;
}) {
  const user = await requireUser();
  const { id } = await params;

  const res = await serverFetch<ApiResponse<{ project: ProjectDetail }>>(
    `/api/projects/${id}`
  );

  if (!res.data?.project) {
    return (
      <div className="px-5 py-16 text-center font-mono text-[13px] text-gw-sub">
        Project not found
      </div>
    );
  }

  return (
    <ProjectDetailClient
      project={res.data.project}
      currentUser={{ id: user.id, role: user.role }}
    />
  );
}