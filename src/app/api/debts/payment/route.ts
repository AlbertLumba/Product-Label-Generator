// 📁 src/app/api/debts/payment/route.ts

import { z } from "zod";
import { apiHandler, getBody } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { ok, unauthorized, notFound, badRequest } from "@/lib/api/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeDebt } from "@/lib/api/debt-serializer";

const paymentSchema = z.object({
  debtId: z.string().min(1),
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

  const { debtId, amount, method, notes } = result.data;

  const debt = await prisma.debt.findUnique({ where: { id: debtId } });
  if (!debt) return notFound("Debt not found");
  if (debt.status !== "ACTIVE") return badRequest("Can only add payments to active debts");
  if (amount > Number(debt.balance)) return badRequest("Payment exceeds remaining balance");

  const updated = await prisma.debt.update({
    where: { id: debtId },
    data: {
      balance: Number(debt.balance) - amount,
      status: Number(debt.balance) - amount === 0 ? "PAID" : "ACTIVE",
      payments: {
        create: {
          amount,
          method,
          notes: notes || null,
        },
      },
    },
    include: { items: true, payments: true },
  });

  return ok(serializeDebt(updated));
});