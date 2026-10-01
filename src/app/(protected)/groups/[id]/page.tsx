// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/groups/[id]/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { requireUser } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/api/server-fetch";
import { GroupDetailClient } from "./components/GroupDetailClient";
import type { ApiResponse } from "@/lib/api/types";

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  userRole: "ADMIN" | "USER";
  groupRole:
    | "TEAM_LEADER"
    | "SUB_TEAM_LEADER"
    | "FRONTEND"
    | "BACKEND"
    | "PRODUCT_SPECIALIST"
    | "MEMBER";
  joinedAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  lead: { id: string; name: string } | null;
  startDate: string | null;
  dueDate: string | null;
  taskCount: number;
  createdAt: string;
}

export interface GroupTaskSummary {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  isReviewed: boolean;
  authorName: string;
  assignee: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  createdAt: string;
}

export interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  leader: { id: string; name: string; email: string } | null;
  createdAt: string;
  members: GroupMember[];
  projects: ProjectSummary[];
  tasks: GroupTaskSummary[];
}

type Params = Promise<{ id: string }>;

export default async function GroupDetailPage({ params }: { params: Params }) {
  const user = await requireUser();
  const { id } = await params;

  const res = await serverFetch<ApiResponse<{ group: GroupDetail }>>(
    `/api/groups/${id}`
  );

  if (!res.data?.group) {
    return (
      <div className="px-5 py-16 text-center font-mono text-[13px] text-gw-sub">
        Group not found
      </div>
    );
  }

  const group = res.data.group;
  const myMembership = group.members.find((m) => m.id === user.id);
  const myGroupRole = myMembership?.groupRole ?? null;

  return (
    <GroupDetailClient
      group={group}
      currentUser={{ id: user.id, role: user.role }}
      myGroupRole={myGroupRole}
    />
  );
}