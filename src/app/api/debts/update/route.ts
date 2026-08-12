// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/debts/update/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from "zod";
import { apiHandler, getBody } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { ok, notFound, badRequest } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { serializeDebt } from "@/lib/api/debt-serializer";

// ─── Schemas ──────────────────────────────────────────────────

const updateDebtSchema = z.object({
  debtId: z.string().min(1, "debtId is required"),
  debtorName: z.string().trim().min(1).optional(),
  debtorEmail: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "PAID", "CANCELLED"]).optional(),
});

const updateItemSchema = z.object({
  itemId: z.string().min(1, "itemId is required"),
  itemName: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  quantity: z.number().int().positive().optional(),
  unitPrice: z.number().nonnegative().optional(),
});

const deleteItemSchema = z.object({
  debtId: z.string().min(1, "debtId is required"),
  itemId: z.string().min(1, "itemId is required"),
});

// ─── Helpers ──────────────────────────────────────────────────

const fullInclude = {
  items: {
    include: {
      payments: {
        orderBy: { paymentDate: "desc" as const },
      },
    },
  },
  payments: {
    orderBy: { paymentDate: "desc" as const },
  },
};

async function recalculateDebt(debtId: string) {
  const allItems = await prisma.debtItem.findMany({
    where: { debtId },
  });
  const newTotalAmount = allItems.reduce((sum, i) => sum + Number(i.totalPrice), 0);
  const newTotalPaid = allItems.reduce((sum, i) => sum + Number(i.paidAmount), 0);
  const newBalance = newTotalAmount - newTotalPaid;

  const debt = await prisma.debt.findUnique({ where: { id: debtId } });
  const newStatus = newBalance <= 0 ? "PAID" : debt!.status === "CANCELLED" ? "CANCELLED" : "ACTIVE";

  return prisma.debt.update({
    where: { id: debtId },
    data: {
      totalAmount: newTotalAmount,
      balance: newBalance,
      status: newStatus as "ACTIVE" | "PAID" | "CANCELLED",
    },
    include: fullInclude,
  });
}

// ─── POST: Update debt or item ──────────────────────────────────

export const POST = apiHandler(async (req) => {
  const body = (await getBody(req)) as Record<string, unknown>;
  const action = (body.action as string) || "updateDebt";

  switch (action) {
    case "updateDebt": {
      const result = validate(updateDebtSchema, body);
      if (!result.success) return result.response;

      const { debtId, ...updateData } = result.data;

      const existing = await prisma.debt.findUnique({ where: { id: debtId } });
      if (!existing) return notFound("Debt not found");

      const cleanData: Record<string, unknown> = {};
      if (updateData.debtorName !== undefined) cleanData.debtorName = updateData.debtorName;
      if (updateData.debtorEmail !== undefined) cleanData.debtorEmail = updateData.debtorEmail || null;
      if (updateData.notes !== undefined) cleanData.notes = updateData.notes || null;
      if (updateData.status !== undefined) cleanData.status = updateData.status;

      const updated = await prisma.debt.update({
        where: { id: debtId },
        data: cleanData,
        include: fullInclude,
      });

      return ok(serializeDebt(updated));
    }

    case "updateItem": {
      const result = validate(updateItemSchema, body);
      if (!result.success) return result.response;

      const { itemId, ...updateData } = result.data;

      const item = await prisma.debtItem.findUnique({
        where: { id: itemId },
        include: { debt: true },
      });
      if (!item) return notFound("Item not found");

      const cleanData: Record<string, unknown> = {};
      if (updateData.itemName !== undefined) cleanData.itemName = updateData.itemName;
      if (updateData.description !== undefined) cleanData.description = updateData.description || null;
      if (updateData.quantity !== undefined) cleanData.quantity = updateData.quantity;
      if (updateData.unitPrice !== undefined) cleanData.unitPrice = updateData.unitPrice;

      const newQuantity = updateData.quantity ?? item.quantity;
      const newUnitPrice = updateData.unitPrice ?? Number(item.unitPrice);
      cleanData.totalPrice = newQuantity * newUnitPrice;

      await prisma.debtItem.update({
        where: { id: itemId },
        data: cleanData,
      });

      const updated = await recalculateDebt(item.debtId);
      return ok(serializeDebt(updated));
    }

    case "deleteItem": {
      const result = validate(deleteItemSchema, body);
      if (!result.success) return result.response;

      const { debtId, itemId } = result.data;

      const item = await prisma.debtItem.findUnique({ where: { id: itemId } });
      if (!item) return notFound("Item not found");

      // Delete item payments first, then item
      await prisma.itemPayment.deleteMany({ where: { itemId } });
      await prisma.debtItem.delete({ where: { id: itemId } });

      const remainingItems = await prisma.debtItem.findMany({
        where: { debtId },
      });

      if (remainingItems.length === 0) {
        await prisma.payment.deleteMany({ where: { debtId } });
        await prisma.debt.delete({ where: { id: debtId } });
        return ok({ deleted: true, debtId });
      }

      const updated = await recalculateDebt(debtId);
      return ok(serializeDebt(updated));
    }

    default:
      return badRequest("Invalid action");
  }
});