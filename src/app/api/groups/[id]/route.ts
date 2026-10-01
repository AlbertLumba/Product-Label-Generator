// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/groups/[id]/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { updateGroupSchema } from "@/lib/validations/group";
import { canEditGroup } from "@/lib/permissions/group";

export const GET = apiHandler<{ id: string }>(async (_req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id } = await ctx.params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      leader: { select: { id: true, name: true, email: true } },
      members: {
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
      projects: {
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        include: {
          lead: { select: { id: true, name: true } },
          _count: { select: { tasks: true } },
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          author: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!group) return fail(404, "Group not found");

  if (user.role !== "ADMIN") {
    const isMember = group.members.some((m) => m.user.id === user.id);
    if (!isMember) return fail(403, "Forbidden");
  }

  return ok({
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      leader: group.leader,
      createdAt: group.createdAt,
      members: group.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        userRole: m.user.role,
        groupRole: m.role,
        joinedAt: m.joinedAt,
      })),
      projects: group.projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        lead: p.lead,
        startDate: p.startDate,
        dueDate: p.dueDate,
        taskCount: p._count.tasks,
        createdAt: p.createdAt,
      })),
      tasks: group.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        isReviewed: t.reviewedById !== null,
        authorName: t.author.name,
        assignee: t.assignee,
        project: t.project,
        createdAt: t.createdAt,
      })),
    },
  });
});

export const PATCH = apiHandler<{ id: string }>(async (req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id } = await ctx.params;

  const existing = await prisma.group.findUnique({ where: { id } });
  if (!existing) return fail(404, "Group not found");

  const allowed = await canEditGroup(user, id);
  if (!allowed) return fail(403, "Forbidden");

  const body = await req.json().catch(() => null);
  const parsed = updateGroupSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const { name, description, leaderId } = parsed.data;

  if (leaderId !== undefined && leaderId !== null) {
    const leaderUser = await prisma.user.findUnique({
      where: { id: leaderId },
      select: { id: true },
    });
    if (!leaderUser) return fail(404, "Leader user not found");
  }

  if (leaderId !== undefined && user.role !== "ADMIN") {
    return fail(403, "Only admin can change the team leader");
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (leaderId !== undefined) {
      if (existing.leaderId && existing.leaderId !== leaderId) {
        await tx.userGroup.updateMany({
          where: { groupId: id, userId: existing.leaderId },
          data: { role: "MEMBER" },
        });
      }
      if (leaderId) {
        await tx.userGroup.upsert({
          where: { userId_groupId: { userId: leaderId, groupId: id } },
          update: { role: "TEAM_LEADER" },
          create: { userId: leaderId, groupId: id, role: "TEAM_LEADER" },
        });
      }
    }

    return tx.group.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(leaderId !== undefined ? { leaderId } : {}),
      },
      include: {
        leader: { select: { id: true, name: true } },
      },
    });
  });

  return ok({
    group: {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      leader: updated.leader,
    },
  });
});

export const DELETE = apiHandler<{ id: string }>(async (_req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  if (user.role !== "ADMIN") return fail(403, "Admin only");

  const { id } = await ctx.params;

  const existing = await prisma.group.findUnique({ where: { id } });
  if (!existing) return fail(404, "Group not found");

  await prisma.group.delete({ where: { id } });

  return ok({ deleted: true, id });
});