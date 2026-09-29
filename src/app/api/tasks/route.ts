// src/app/api/tasks/route.ts

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { createTaskSchema, listTasksQuerySchema } from "@/lib/validations/task";

export const GET = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const url = new URL(req.url);
  const parsed = listTasksQuerySchema.safeParse(
    Object.fromEntries(url.searchParams)
  );
  if (!parsed.success) return fail(400, "Invalid query", parsed.error.flatten());

  const { scope, groupId, authorId, priority, reviewed, q, page, pageSize } =
    parsed.data;

  const canViewAll = user.role === "ADMIN";
  const effectiveScope = canViewAll ? scope : "mine";

  const where: any = {};

  if (effectiveScope === "mine") where.authorId = user.id;
  else if (authorId) where.authorId = authorId;

  if (groupId) where.groupId = groupId;
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
        group: { select: { id: true, name: true } },
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
      group: t.group,
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

  const { title, description, priority, groupId, dueDate } = parsed.data;

  if (groupId && user.role !== "ADMIN") {
    const membership = await prisma.userGroup.findFirst({
      where: { userId: user.id, groupId },
    });
    if (!membership) return fail(403, "You are not a member of that group");
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      priority,
      groupId: groupId ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
      authorId: user.id,
      activityLogs: {
        create: {
          actorId: user.id,
          action: "CREATED",
          metadata: { source: "api" },
        },
      },
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      group: { select: { id: true, name: true } },
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
      group: task.group,
    },
  });
});