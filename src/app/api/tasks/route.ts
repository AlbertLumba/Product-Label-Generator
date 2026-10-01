// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/tasks/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { createTaskSchema, listTasksQuerySchema } from "@/lib/validations/task";
import type { Prisma } from "@prisma/client";

export const GET = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const url = new URL(req.url);
  const parsed = listTasksQuerySchema.safeParse(
    Object.fromEntries(url.searchParams)
  );
  if (!parsed.success) return fail(400, "Invalid query", parsed.error.flatten());

  const {
    scope,
    groupId,
    projectId,
    authorId,
    assigneeId,
    priority,
    reviewed,
    q,
    page,
    pageSize,
  } = parsed.data;

  const canViewAll = user.role === "ADMIN";
  const effectiveScope = canViewAll ? scope : "mine";

  const where: Prisma.TaskWhereInput = {};

  if (effectiveScope === "mine") where.authorId = user.id;
  else if (authorId) where.authorId = authorId;

  if (groupId) where.groupId = groupId;
  if (projectId) where.projectId = projectId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (priority) where.priority = priority;
  if (reviewed === "true") where.reviewedById = { not: null };
  if (reviewed === "false") where.reviewedById = null;

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true } },
        _count: { select: { comments: true, activityLogs: true } },
      },
    }),
  ]);

  return ok({
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      dueDate: t.dueDate,
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      author: t.author,
      assignee: t.assignee,
      group: t.group,
      project: t.project,
      reviewedBy: t.reviewedBy,
      reviewedAt: t.reviewedAt,
      isReviewed: t.reviewedById !== null,
      commentsCount: t._count.comments,
    })),
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
});

export const POST = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const body = await req.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
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
  } = parsed.data;

  // If projectId is provided, look up its parent group
  let resolvedGroupId = groupId ?? null;
  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { groupId: true },
    });
    if (!project) return fail(404, "Project not found");
    resolvedGroupId = project.groupId;
  }

  // Non-admin must be a member of the resolved group
  if (resolvedGroupId && user.role !== "ADMIN") {
    const membership = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: { userId: user.id, groupId: resolvedGroupId },
      },
    });
    if (!membership) return fail(403, "You are not a member of that group");
  }

  // Assignee must be a member of the resolved group
  if (assigneeId && resolvedGroupId) {
    const assigneeMembership = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: { userId: assigneeId, groupId: resolvedGroupId },
      },
    });
    if (!assigneeMembership) {
      return fail(400, "Assignee must be a member of the group");
    }
  } else if (assigneeId && !resolvedGroupId) {
    return fail(400, "Cannot assign a user to a task without a group");
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      priority,
      groupId: resolvedGroupId,
      projectId: projectId ?? null,
      assigneeId: assigneeId ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
      authorId: user.id,
      activityLogs: {
        create: {
          actorId: user.id,
          action: "CREATED",
          metadata: {
            source: "api",
            assigneeId: assigneeId ?? null,
            projectId: projectId ?? null,
          },
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
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      author: task.author,
      assignee: task.assignee,
      group: task.group,
      project: task.project,
    },
  });
});