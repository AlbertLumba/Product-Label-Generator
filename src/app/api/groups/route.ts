// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/groups/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
});

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
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { members: true, tasks: true } },
    },
    orderBy: { name: "asc" },
  });

  return ok({
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      memberCount: g._count.members,
      taskCount: g._count.tasks,
    })),
  });
});

export const POST = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  if (user.role !== "ADMIN") return fail(403, "Admin only");

  const body = await req.json().catch(() => null);
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const existing = await prisma.group.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) return fail(409, "A group with that name already exists");

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    },
  });

  return ok({ group });
});