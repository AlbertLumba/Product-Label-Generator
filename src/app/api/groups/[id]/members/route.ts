// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/groups/[id]/members/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { addMemberSchema } from "@/lib/validations/group";
import {
  canManageRoster,
  canAssignRole,
  isTeamLeader,
} from "@/lib/permissions/group";

type Ctx = { params: Promise<{ id: string }> };

export const POST = apiHandler<{ id: string }>(async (req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id: groupId } = await ctx.params;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return fail(404, "Group not found");

  const allowed = await canManageRoster(user, groupId);
  if (!allowed) return fail(403, "Forbidden");

  const body = await req.json().catch(() => null);
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const { userId, role } = parsed.data;

  const actorIsTL = await isTeamLeader(user.id, groupId);
  if (!canAssignRole(user, actorIsTL, role)) {
    return fail(403, "You cannot assign that role");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!targetUser) return fail(404, "User not found");

  const existing = await prisma.userGroup.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (existing) return fail(409, "User is already a member");

  const created = await prisma.userGroup.create({
    data: { userId, groupId, role },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  return ok({
    member: {
      id: created.user.id,
      name: created.user.name,
      email: created.user.email,
      userRole: created.user.role,
      groupRole: created.role,
      joinedAt: created.joinedAt,
    },
  });
});