// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/debts/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { serverFetch } from "@/lib/api/server-fetch";
import { DebtsClient } from "./components/DebtsClient";
import type { Debt } from "./components/DebtCard";
import type { ApiResponse } from "@/lib/api/types";

export default async function DebtsPage() {
  const res = await serverFetch<ApiResponse<Debt[]>>("/api/debts/fetch");
  const debts = res.data ?? [];

  return <DebtsClient initialDebts={debts} />;
}