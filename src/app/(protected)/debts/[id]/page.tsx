// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/debts/[id]/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { DebtDetail } from "./components/DebtDetail";
import type { Debt } from "../components/DebtCard";

export default async function DebtDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const debt = await prisma.debt.findUnique({
    where: { id: params.id },
    include: { items: true, payments: true },
  });

  if (!debt) notFound();

  // Prisma Decimal fields aren't plain numbers — convert before
  // passing to client components.
  const formatted: Debt = {
    id: debt.id,
    debtorName: debt.debtorName,
    debtorEmail: debt.debtorEmail,
    accessCode: debt.accessCode,
    totalAmount: Number(debt.totalAmount),
    balance: Number(debt.balance),
    status: debt.status,
    notes: debt.notes,
    createdAt: debt.createdAt,
    items: debt.items.map((item) => ({
      id: item.id,
      itemName: item.itemName,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      purchasedAt: item.purchasedAt,
    })),
    payments: debt.payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      paymentDate: payment.paymentDate,
      method: payment.method,
      notes: payment.notes,
    })),
  };

  return <DebtDetail debt={formatted} />;
}