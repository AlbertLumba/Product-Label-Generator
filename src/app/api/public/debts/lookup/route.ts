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
    include: {
      items: {
        include: {
          payments: {
            orderBy: { paymentDate: "desc" },
          },
        },
      },
    },
  });

  if (!debt) {
    return notFound("No debt found for that access code");
  }

  // Flatten item-level payments into a single history list, each tagged
  // with which item it was applied to. This is the real source of truth
  // for "what did this payment go towards" — the debt-level Payment model
  // doesn't carry an itemId, but ItemPayment does.
  const payments = debt.items
    .flatMap((item) =>
      item.payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        paymentDate: p.paymentDate,
        method: p.method,
        notes: p.notes,
        itemId: item.id,
        itemName: item.itemName,
      }))
    )
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

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
      paidAmount: Number(item.paidAmount),
      purchasedAt: item.purchasedAt,
    })),
    payments,
  });
});