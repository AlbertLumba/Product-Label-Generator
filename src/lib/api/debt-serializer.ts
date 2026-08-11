// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/api/debt-serializer.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Prisma returns Decimal fields as Decimal objects, not plain
// numbers — every route that sends a Debt to the client needs this
// conversion, so it lives here once instead of copy-pasted per route.

import type { Debt, DebtItem, Payment } from "@prisma/client";

type DebtWithRelations = Debt & { items: DebtItem[]; payments: Payment[] };

export function serializeDebt(debt: DebtWithRelations) {
  return {
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
}