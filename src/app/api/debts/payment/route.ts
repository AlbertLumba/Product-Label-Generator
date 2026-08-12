// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/debts/payment/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from "zod";
import { apiHandler, getBody } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { ok, unauthorized, notFound, badRequest } from "@/lib/api/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeDebt } from "@/lib/api/debt-serializer";

const paymentSchema = z.object({
  debtId: z.string().min(1),
  itemId: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(["CASH", "BANK_TRANSFER", "E_WALLET", "OTHER"]),
  notes: z.string().trim().optional(),
});

export const POST = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return unauthorized();

  const body = await getBody(req);
  const result = validate(paymentSchema, body);
  if (!result.success) return result.response;

  const { debtId, itemId, amount, method, notes } = result.data;

  const debt = await prisma.debt.findUnique({ where: { id: debtId } });
  if (!debt) return notFound("Debt not found");
  if (debt.status !== "ACTIVE") return badRequest("Can only add payments to active debts");
  if (amount > Number(debt.balance)) return badRequest("Payment exceeds remaining balance");

  const item = await prisma.debtItem.findUnique({ where: { id: itemId } });
  if (!item) return notFound("Item not found");
  if (amount > Number(item.totalPrice) - Number(item.paidAmount)) {
    return badRequest("Payment exceeds item remaining balance");
  }

  // Create payment on item
  await prisma.itemPayment.create({
    data: {
      itemId,
      amount,
      method,
      notes: notes || null,
    },
  });

  // Update item paid amount
  const newItemPaid = Number(item.paidAmount) + amount;
  await prisma.debtItem.update({
    where: { id: itemId },
    data: { paidAmount: newItemPaid },
  });

  // Recalculate debt totals from all items
  const allItems = await prisma.debtItem.findMany({
    where: { debtId },
  });
  const newTotalAmount = allItems.reduce((sum, i) => sum + Number(i.totalPrice), 0);
  const newTotalPaid = allItems.reduce((sum, i) => sum + Number(i.paidAmount), 0);
  const newBalance = newTotalAmount - newTotalPaid;

  const updated = await prisma.debt.update({
    where: { id: debtId },
    data: {
      totalAmount: newTotalAmount,
      balance: newBalance,
      status: newBalance === 0 ? "PAID" : "ACTIVE",
      // Also add to debt-level payments for history
      payments: {
        create: {
          amount,
          method,
          notes: notes || null,
        },
      },
    },
    include: {
      items: {
        include: { payments: true },
      },
      payments: true,
    },
  });

  return ok(serializeDebt(updated));
});