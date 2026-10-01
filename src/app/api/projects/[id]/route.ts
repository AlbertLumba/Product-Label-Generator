// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/projects/[id]/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { updateProjectSchema } from "@/lib/validations/project";
import { canEditProject } from "@/lib/permissions/group";

export const GET = apiHandler<{ id: string }>(async (_req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id } = await ctx.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      lead: { select: { id: true, name: true, email: true } },
      group: {
        select: {
          id: true,
          name: true,
          leader: { select: { id: true, name: true } },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!project) return fail(404, "Project not found");

  if (user.role !== "ADMIN") {
    const isMember = project.group.members.some(
      (m) => m.user.id === user.id
    );
    if (!isMember) return fail(403, "Forbidden");
  }

  return ok({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      lead: project.lead,
      startDate: project.startDate,
      dueDate: project.dueDate,
      createdAt: project.createdAt,
      group: {
        id: project.group.id,
        name: project.group.name,
        leader: project.group.leader,
      },
      members: project.group.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        userRole: m.user.role,
        groupRole: m.role,
      })),
      tasks: project.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        isReviewed: t.reviewedById !== null,
        authorName: t.author.name,
        assignee: t.assignee,
        createdAt: t.createdAt,
      })),
    },
  });
});

export const PATCH = apiHandler<{ id: string }>(async (req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id } = await ctx.params;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return fail(404, "Project not found");

  const allowed = await canEditProject(
    user,
    existing.groupId,
    existing.leadId
  );
  if (!allowed) return fail(403, "Forbidden");

  const body = await req.json().catch(() => null);
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const { name, description, status, leadId, startDate, dueDate } =
    parsed.data;

  if (leadId) {
    const membership = await prisma.userGroup.findUnique({
      where: { userId_groupId: { userId: leadId, groupId: existing.groupId } },
    });
    if (!membership) {
      return fail(400, "Project lead must be a member of the group");
    }
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(leadId !== undefined ? { leadId } : {}),
      ...(startDate !== undefined
        ? { startDate: startDate ? new Date(startDate) : null }
        : {}),
      ...(dueDate !== undefined
        ? { dueDate: dueDate ? new Date(dueDate) : null }
        : {}),
    },
    include: {
      lead: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
    },
  });

  return ok({
    project: {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      status: updated.status,
      lead: updated.lead,
      startDate: updated.startDate,
      dueDate: updated.dueDate,
      taskCount: updated._count.tasks,
      createdAt: updated.createdAt,
    },
  });
});

export const DELETE = apiHandler<{ id: string }>(async (_req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id } = await ctx.params;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return fail(404, "Project not found");

  const allowed = await canEditProject(
    user,
    existing.groupId,
    existing.leadId
  );
  if (!allowed) return fail(403, "Forbidden");

  await prisma.project.delete({ where: { id } });

  return ok({ deleted: true, id });
});