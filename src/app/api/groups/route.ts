// src/app/api/groups/route.ts

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export const GET = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "true";

  const groups = await prisma.group.findMany({
    where:
      mine && user.role !== "ADMIN"
        ? { members: { some: { userId: user.id } } }
        : undefined,
    select: { id: true, name: true, description: true },
    orderBy: { name: "asc" },
  });

  return ok({ groups });
});