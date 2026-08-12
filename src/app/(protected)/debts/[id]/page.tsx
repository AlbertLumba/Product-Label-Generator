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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const debt = await prisma.debt.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          payments: {
            orderBy: { paymentDate: "desc" },
          },
        },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  });

  if (!debt) notFound();

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
      paidAmount: Number(item.paidAmount),
      purchasedAt: item.purchasedAt,
      payments: item.payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        paymentDate: p.paymentDate,
        method: p.method,
        notes: p.notes,
      })),
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