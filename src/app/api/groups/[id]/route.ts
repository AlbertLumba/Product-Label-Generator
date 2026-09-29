// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/groups/[id]/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

export const GET = apiHandler(async (_req, ctx: Ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id } = await ctx.params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          author: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!group) return fail(404, "Group not found");

  // Non-admin: must be a member to view
  if (user.role !== "ADMIN") {
    const isMember = group.members.some((m) => m.user.id === user.id);
    if (!isMember) return fail(403, "Forbidden");
  }

  return ok({
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt,
      members: group.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.user.role,
      })),
      tasks: group.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        isReviewed: t.reviewedById !== null,
        authorName: t.author.name,
        createdAt: t.createdAt,
      })),
    },
  });
});

export const PATCH = apiHandler(async (req, ctx: Ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  if (user.role !== "ADMIN") return fail(403, "Admin only");

  const { id } = await ctx.params;

  const existing = await prisma.group.findUnique({ where: { id } });
  if (!existing) return fail(404, "Group not found");

  const body = await req.json().catch(() => null);
  const parsed = updateGroupSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const updated = await prisma.group.update({
    where: { id },
    data: parsed.data,
  });

  return ok({ group: updated });
});

export const DELETE = apiHandler(async (_req, ctx: Ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  if (user.role !== "ADMIN") return fail(403, "Admin only");

  const { id } = await ctx.params;

  const existing = await prisma.group.findUnique({ where: { id } });
  if (!existing) return fail(404, "Group not found");

  await prisma.group.delete({ where: { id } });

  return ok({ deleted: true, id });
});