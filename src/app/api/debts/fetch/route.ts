// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/debts/fetch/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/handler";
import { ok, notFound, unauthorized } from "@/lib/api/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeDebt } from "@/lib/api/debt-serializer";

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await getUser();
  if (!user) return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  const accessCode = req.nextUrl.searchParams.get("accessCode");

  if (id || accessCode) {
    const debt = await prisma.debt.findFirst({
      where: id ? { id } : { accessCode: accessCode! },
      include: { items: true, payments: true },
    });

    if (!debt) return notFound("Debt not found");

    return ok(serializeDebt(debt));
  }

  const debts = await prisma.debt.findMany({
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return ok(debts.map(serializeDebt));
});