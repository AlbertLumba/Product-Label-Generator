// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/groups/[id]/members/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const addMemberSchema = z.object({
  userId: z.string().min(1),
});

export const POST = apiHandler(async (req, ctx: Ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  if (user.role !== "ADMIN") return fail(403, "Admin only");

  const { id: groupId } = await ctx.params;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return fail(404, "Group not found");

  const body = await req.json().catch(() => null);
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const targetUser = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!targetUser) return fail(404, "User not found");

  const existing = await prisma.userGroup.findUnique({
    where: {
      userId_groupId: { userId: targetUser.id, groupId },
    },
  });
  if (existing) return fail(409, "User is already a member");

  await prisma.userGroup.create({
    data: { userId: targetUser.id, groupId },
  });

  return ok({
    member: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
    },
  });
});

export const DELETE = apiHandler(async (req, ctx: Ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  if (user.role !== "ADMIN") return fail(403, "Admin only");

  const { id: groupId } = await ctx.params;
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return fail(400, "userId is required");

  await prisma.userGroup.deleteMany({ where: { userId, groupId } });

  return ok({ removed: true, userId, groupId });
});