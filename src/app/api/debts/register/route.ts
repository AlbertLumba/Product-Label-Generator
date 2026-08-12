// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/debts/register/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  // Reuse the existing code if this debtor already has one, regardless of debt status
  const existingDebt = await prisma.debt.findFirst({
    where: { debtorName },
    select: { accessCode: true },
  });
  if (existingDebt) return existingDebt.accessCode;

  const base = debtorName
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  // First attempt: the code is just the name itself.
  const clash = await prisma.debt.findFirst({
    where: { accessCode: base },
  });
  if (!clash) return base;

  // Someone else already has this exact code (different name, same normalized form) —
  // append an incrementing number, still fully derived from the name.
  for (let n = 2; n < 100; n++) {
    const code = `${base}${n}`;
    const collision = await prisma.debt.findFirst({
      where: { accessCode: code },
    });
    if (!collision) return code;
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