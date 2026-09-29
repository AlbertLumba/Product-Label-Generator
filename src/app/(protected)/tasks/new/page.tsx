// src/app/(protected)/tasks/new/page.tsx

import { serverFetch } from "@/lib/api/server-fetch";
import { NewTaskClient } from "./components/NewTaskClient";
import type { ApiResponse } from "@/lib/api/types";

interface GroupOption {
  id: string;
  name: string;
}

export default async function NewTaskPage() {
  const res = await serverFetch<ApiResponse<{ groups: GroupOption[] }>>(
    "/api/groups?mine=true"
  );

  return <NewTaskClient groups={res.data?.groups ?? []} />;
}