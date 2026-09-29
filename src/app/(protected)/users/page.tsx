// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/users/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { requireAdmin } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/api/server-fetch";
import { UsersClient } from "./components/UsersClient";
import type { ApiResponse } from "@/lib/api/types";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  taskCount: number;
  groupCount: number;
}

interface UsersListResponse {
  users: UserRow[];
}

export default async function UsersPage() {
  await requireAdmin();

  const res = await serverFetch<ApiResponse<UsersListResponse>>("/api/users");

  return <UsersClient initial={res.data?.users ?? []} />;
}