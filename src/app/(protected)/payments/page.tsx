// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/payments/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { serverFetch } from "@/lib/api/server-fetch";
import { PaymentsClient } from "./components/PaymentsClient";
import type { ApiResponse } from "@/lib/api/types";
import type { Debt } from "@/app/(protected)/debts/components/DebtCard";

export interface PaymentRecord {
  id: string;
  amount: number;
  paymentDate: string;
  method: "CASH" | "BANK_TRANSFER" | "E_WALLET" | "OTHER";
  notes?: string | null;
  debt: {
    id: string;
    debtorName: string;
    accessCode: string;
    balance: number;
    status: string;
  };
}

export default async function PaymentsPage() {
  const res = await serverFetch<ApiResponse<Debt[]>>("/api/debts/fetch");
  const debts = res.data ?? [];
  
  // Extract all payments from all debts
  const payments: PaymentRecord[] = [];
  
  for (const debt of debts) {
    if (debt.payments && debt.payments.length > 0) {
      for (const payment of debt.payments) {
        payments.push({
          id: payment.id,
          amount: payment.amount,
          paymentDate: typeof payment.paymentDate === "string" 
            ? payment.paymentDate 
            : (payment.paymentDate as Date).toISOString(),
          method: payment.method,
          notes: payment.notes,
          debt: {
            id: debt.id,
            debtorName: debt.debtorName,
            accessCode: debt.accessCode,
            balance: debt.balance,
            status: debt.status,
          },
        });
      }
    }
  }

  // Sort by most recent first
  payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  return <PaymentsClient payments={payments} />;
}