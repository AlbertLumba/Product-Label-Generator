// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/tasks/[id]/comments/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations/task";
import type { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

async function assertTaskAccess(taskId: string, user: { id: string; role: string }) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { ok: false as const, code: 404, message: "Task not found" };
  if (user.role !== "ADMIN" && task.authorId !== user.id)
    return { ok: false as const, code: 403, message: "Forbidden" };
  return { ok: true as const, task };
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return apiHandler(async () => {
    const user = await getUser();
    if (!user) return fail(401, "Unauthorized");

    const { id } = await ctx.params;
    const access = await assertTaskAccess(id, user);
    if (!access.ok) return fail(access.code, access.message);

    const comments = await prisma.comment.findMany({
      where: { taskId: id },
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
  })(req, ctx);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return apiHandler(async () => {
    const user = await getUser();
    if (!user) return fail(401, "Unauthorized");

    const { id } = await ctx.params;
    const access = await assertTaskAccess(id, user);
    if (!access.ok) return fail(access.code, access.message);

    const body = await req.json().catch(() => null);
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success)
      return fail(400, "Invalid input", parsed.error.flatten());

    const comment = await prisma.comment.create({
      data: {
        taskId: id,
        authorId: user.id,
        body: parsed.data.body,
      },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    await prisma.activityLog.create({
      data: {
        taskId: id,
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
  })(req, ctx);
}