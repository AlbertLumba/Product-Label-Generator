// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/groups/[id]/members/[userId]/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { updateMemberRoleSchema } from "@/lib/validations/group";
import {
  canManageRoster,
  canAssignRole,
  isTeamLeader,
} from "@/lib/permissions/group";

type Ctx = { params: Promise<{ id: string; userId: string }> };

export const PATCH = apiHandler<{ id: string; userId: string }>(
  async (req, ctx) => {
    const user = await getUser();
    if (!user) return fail(401, "Unauthorized");

    const { id: groupId, userId } = await ctx.params;

    const allowed = await canManageRoster(user, groupId);
    if (!allowed) return fail(403, "Forbidden");

    const body = await req.json().catch(() => null);
    const parsed = updateMemberRoleSchema.safeParse(body);
    if (!parsed.success)
      return fail(400, "Invalid input", parsed.error.flatten());

    const actorIsTL = await isTeamLeader(user.id, groupId);
    if (!canAssignRole(user, actorIsTL, parsed.data.role)) {
      return fail(403, "You cannot assign that role");
    }

    const existing = await prisma.userGroup.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (!existing) return fail(404, "Membership not found");

    const updated = await prisma.userGroup.update({
      where: { userId_groupId: { userId, groupId } },
      data: { role: parsed.data.role },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return ok({
      member: {
        id: updated.user.id,
        name: updated.user.name,
        email: updated.user.email,
        userRole: updated.user.role,
        groupRole: updated.role,
        joinedAt: updated.joinedAt,
      },
    });
  },
);

export const DELETE = apiHandler<{ id: string; userId: string }>(
  async (_req, ctx) => {
    const user = await getUser();
    if (!user) return fail(401, "Unauthorized");

    const { id: groupId, userId } = await ctx.params;

    const allowed = await canManageRoster(user, groupId);
    if (!allowed) return fail(403, "Forbidden");

    // Nobody can remove the TL — only admin can, via the group PATCH
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return fail(404, "Group not found");
    if (group.leaderId === userId && user.role !== "ADMIN") {
      return fail(403, "Only admin can remove the team leader");
    }

    // Users cannot remove themselves here (they should leave via group PATCH)
    if (userId === user.id && user.role !== "ADMIN") {
      return fail(400, "You cannot remove yourself from this group");
    }

    const existing = await prisma.userGroup.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (!existing) return fail(404, "Membership not found");

    await prisma.userGroup.delete({
      where: { userId_groupId: { userId, groupId } },
    });

    return ok({ removed: true, userId, groupId });
  },
);