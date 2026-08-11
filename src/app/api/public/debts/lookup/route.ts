// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/public/debts/lookup/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from "zod";
import { apiHandler, getBody } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { ok, notFound } from "@/lib/api/server";
import prisma from "@/lib/prisma";

const lookupSchema = z.object({
  accessCode: z.string().trim().min(1, "Access code is required"),
});

export const POST = apiHandler(async (req) => {
  const body = await getBody(req);

  const result = validate(lookupSchema, body);
  if (!result.success) return result.response;

  const { accessCode } = result.data;

  const debt = await prisma.debt.findFirst({
    where: { accessCode },
    include: { items: true, payments: true },
  });

  if (!debt) {
    return notFound("No debt found for that access code");
  }

  return ok({
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
  });
});