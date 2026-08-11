// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/debts/register/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import crypto from "crypto";
import { z } from "zod";
import { apiHandler, getBody } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { created } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { serializeDebt } from "@/lib/api/debt-serializer";

const debtItemSchema = z.object({
  itemName: z.string().trim().min(1, "Item name is required"),
  description: z.string().trim().optional(),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().nonnegative(),
});

const registerDebtSchema = z.object({
  debtorName: z.string().trim().min(1, "Debtor name is required"),
  debtorEmail: z
    .string()
    .trim()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().optional(),
  items: z.array(debtItemSchema).min(1, "At least one item is required"),
});

async function generateAccessCode(debtorName: string): Promise<string> {
  const prefix = debtorName
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = crypto.randomInt(1000, 9999);
    const code = `${prefix}${suffix}`;
    const existing = await prisma.debt.findFirst({
      where: { accessCode: code },
    });
    if (!existing) return code;
  }

  throw new Error("Could not generate a unique access code");
}

export const POST = apiHandler(async (req) => {
  const body = await getBody(req);

  const result = validate(registerDebtSchema, body);
  if (!result.success) return result.response;

  const { debtorName, debtorEmail, notes, items } = result.data;

  const itemsWithTotals = items.map((item) => ({
    itemName: item.itemName,
    description: item.description || null,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.quantity * item.unitPrice,
  }));

  const newItemsTotal = itemsWithTotals.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  // Check for existing active debt for same debtor
  const existing = await prisma.debt.findFirst({
    where: { debtorName, status: "ACTIVE" },
  });

  if (existing) {
    const updated = await prisma.debt.update({
      where: { id: existing.id },
      data: {
        totalAmount: Number(existing.totalAmount) + newItemsTotal,
        balance: Number(existing.balance) + newItemsTotal,
        debtorEmail: debtorEmail || existing.debtorEmail,
        notes: notes || existing.notes,
        items: { create: itemsWithTotals },
      },
      include: { items: true, payments: true },
    });

    return created(serializeDebt(updated));
  }

  const accessCode = await generateAccessCode(debtorName);

  const debt = await prisma.debt.create({
    data: {
      debtorName,
      debtorEmail: debtorEmail || null,
      accessCode,
      totalAmount: newItemsTotal,
      balance: newItemsTotal,
      notes: notes || null,
      items: { create: itemsWithTotals },
    },
    include: { items: true, payments: true },
  });

  return created(serializeDebt(debt));
});