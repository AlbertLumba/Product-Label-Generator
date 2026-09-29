// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/activity/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const querySchema = z.object({
  action: z.string().optional(),
  actorId: z.string().optional(),
  taskId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
});

export const GET = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success)
    return fail(400, "Invalid query", parsed.error.flatten());

  const { action, actorId, taskId, page, pageSize } = parsed.data;

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (actorId) where.actorId = actorId;
  if (taskId) where.taskId = taskId;

  // Non-admins only see activity on their own tasks
  if (user.role !== "ADMIN") {
    where.task = { authorId: user.id };
  }

  const [total, logs] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        actor: { select: { id: true, name: true, role: true } },
        task: { select: { id: true, title: true } },
      },
    }),
  ]);

  return ok({
    activity: logs.map((a) => ({
      id: a.id,
      action: a.action,
      metadata: a.metadata,
      createdAt: a.createdAt,
      actor: a.actor,
      task: a.task,
    })),
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
});