// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/payments/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { serverFetch } from "@/lib/api/server-fetch";
import { PaymentsClient } from "./components/PaymentsClient";
import type { ApiResponse } from "@/lib/api/types";

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
  const res = await serverFetch<ApiResponse<PaymentRecord[]>>("/api/debts/fetch");
  const debts = res.data ?? [];
  
  // Extract all payments from all debts
  const payments: PaymentRecord[] = [];
  
  if (Array.isArray(debts)) {
    debts.forEach((debt: any) => {
      if (debt.payments && debt.payments.length > 0) {
        debt.payments.forEach((payment: any) => {
          payments.push({
            id: payment.id,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
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
        });
      }
    });
  }

  // Sort by most recent first
  payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  return <PaymentsClient payments={payments} />;
}