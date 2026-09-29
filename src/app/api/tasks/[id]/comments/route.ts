// src/app/api/tasks/[id]/comments/route.ts

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations/task";

type Ctx = { params: { id: string } };

async function assertTaskAccess(taskId: string, user: { id: string; role: string }) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { ok: false as const, code: 404, message: "Task not found" };
  if (user.role !== "ADMIN" && task.authorId !== user.id)
    return { ok: false as const, code: 403, message: "Forbidden" };
  return { ok: true as const, task };
}

export const GET = apiHandler(async (_req, ctx: Ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const access = await assertTaskAccess(ctx.params.id, user);
  if (!access.ok) return fail(access.code, access.message);

  const comments = await prisma.comment.findMany({
    where: { taskId: ctx.params.id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, role: true } } },
  });

  return ok({
    comments: comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      author: c.author,
    })),
  });
});

export const POST = apiHandler(async (req, ctx: Ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const access = await assertTaskAccess(ctx.params.id, user);
  if (!access.ok) return fail(access.code, access.message);

  const body = await req.json().catch(() => null);
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const comment = await prisma.comment.create({
    data: {
      taskId: ctx.params.id,
      authorId: user.id,
      body: parsed.data.body,
    },
    include: { author: { select: { id: true, name: true, role: true } } },
  });

  // Also log activity
  await prisma.activityLog.create({
    data: {
      taskId: ctx.params.id,
      actorId: user.id,
      action: "COMMENTED",
    },
  });

  return ok({
    comment: {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      author: comment.author,
    },
  });
});