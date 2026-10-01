// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/tasks/[id]/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { updateTaskSchema } from "@/lib/validations/task";

export const GET = apiHandler<{ id: string }>(async (_req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id } = await ctx.params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
      assignee: { select: { id: true, name: true, email: true } },
      group: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, role: true } } },
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!task) return fail(404, "Task not found");
  if (user.role !== "ADMIN" && task.authorId !== user.id)
    return fail(403, "Forbidden");

  return ok({
    task: {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      author: task.author,
      assignee: task.assignee,
      group: task.group,
      project: task.project,
      reviewedBy: task.reviewedBy,
      reviewedAt: task.reviewedAt,
      reviewNotes: task.reviewNotes,
      isReviewed: task.reviewedById !== null,
      comments: task.comments.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        author: c.author,
      })),
      activityLogs: task.activityLogs.map((a) => ({
        id: a.id,
        action: a.action,
        metadata: a.metadata,
        createdAt: a.createdAt,
        actor: a.actor,
      })),
    },
  });
});

export const PATCH = apiHandler<{ id: string }>(async (req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id } = await ctx.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return fail(404, "Task not found");

  const isAdmin = user.role === "ADMIN";
  const isAuthor = existing.authorId === user.id;
  if (!isAdmin && !isAuthor) return fail(403, "Forbidden");
  if (!isAdmin && existing.reviewedById)
    return fail(403, "Cannot edit a task that has already been reviewed");

  const body = await req.json().catch(() => null);
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const {
    title,
    description,
    priority,
    groupId,
    projectId,
    assigneeId,
    dueDate,
    completedAt,
  } = parsed.data;

  // Resolve effective group/project for validation
  let resolvedGroupId =
    groupId !== undefined ? groupId : existing.groupId;

  if (projectId !== undefined && projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { groupId: true },
    });
    if (!project) return fail(404, "Project not found");
    resolvedGroupId = project.groupId;
  }

  // Validate assignee is a member of the resolved group
  const effectiveAssigneeId =
    assigneeId !== undefined ? assigneeId : existing.assigneeId;
  if (effectiveAssigneeId && resolvedGroupId) {
    const membership = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: effectiveAssigneeId,
          groupId: resolvedGroupId,
        },
      },
    });
    if (!membership) {
      return fail(400, "Assignee must be a member of the group");
    }
  }

  const updated = await prisma.task.update({
    where: { id: existing.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(groupId !== undefined ? { groupId } : {}),
      ...(projectId !== undefined ? { projectId } : {}),
      ...(assigneeId !== undefined ? { assigneeId } : {}),
      ...(dueDate !== undefined
        ? { dueDate: dueDate ? new Date(dueDate) : null }
        : {}),
      ...(completedAt !== undefined
        ? { completedAt: completedAt ? new Date(completedAt) : null }
        : {}),
      activityLogs: {
        create: {
          actorId: user.id,
          action: "UPDATED",
          metadata: { fields: Object.keys(parsed.data) },
        },
      },
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
      group: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  return ok({
    task: {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      priority: updated.priority,
      dueDate: updated.dueDate,
      completedAt: updated.completedAt,
      author: updated.author,
      assignee: updated.assignee,
      group: updated.group,
      project: updated.project,
    },
  });
});

export const DELETE = apiHandler<{ id: string }>(async (_req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id } = await ctx.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return fail(404, "Task not found");

  const isAdmin = user.role === "ADMIN";
  const isAuthor = existing.authorId === user.id;
  if (!isAdmin && !isAuthor) return fail(403, "Forbidden");
  if (!isAdmin && existing.reviewedById)
    return fail(403, "Cannot delete a task that has already been reviewed");

  await prisma.task.delete({ where: { id: existing.id } });

  return ok({ deleted: true, id: existing.id });
});