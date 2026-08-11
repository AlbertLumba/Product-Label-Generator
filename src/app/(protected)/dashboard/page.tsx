// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/dashboard/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { serverFetch } from "@/lib/api/server-fetch";
import { DashboardClient } from "./components/DashboardClient";
import type { ApiResponse } from "@/lib/api/types";

export interface DashboardData {
  stats: {
    totalDebts: number;
    activeDebts: number;
    paidDebts: number;
    cancelledDebts: number;
    totalAmount: number;
    totalBalance: number;
    totalCollected: number;
    totalPayments: number;
    totalPaymentAmount: number;
    collectionRate: number;
  };
  topDebts: {
    id: string;
    debtorName: string;
    debtorEmail: string | null;
    accessCode: string;
    totalAmount: number;
    balance: number;
    status: string;
    itemsCount: number;
    lastPayment: { amount: number; date: string } | null;
  }[];
  recentPayments: {
    id: string;
    amount: number;
    paymentDate: string;
    method: string;
    notes: string | null;
    debt: { id: string; debtorName: string; accessCode: string };
  }[];
  recentDebts: {
    id: string;
    debtorName: string;
    accessCode: string;
    totalAmount: number;
    balance: number;
    status: string;
    itemsCount: number;
    createdAt: string;
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