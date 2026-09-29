// src/app/api/tasks/[id]/review/route.ts

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { reviewTaskSchema } from "@/lib/validations/task";

type Ctx = { params: { id: string } };

export const PATCH = apiHandler(async (req, ctx: Ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  if (user.role !== "ADMIN") return fail(403, "Admin only");

  const task = await prisma.task.findUnique({ where: { id: ctx.params.id } });
  if (!task) return fail(404, "Task not found");

  const body = await req.json().catch(() => null);
  const parsed = reviewTaskSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const { reviewNotes, reviewed } = parsed.data;

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: reviewed
      ? {
          reviewedById: user.id,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes ?? null,
          activityLogs: {
            create: {
              actorId: user.id,
              action: "REVIEWED",
              metadata: { reviewNotes: reviewNotes ?? null },
            },
          },
        }
      : {
          reviewedById: null,
          reviewedAt: null,
          reviewNotes: null,
          activityLogs: {
            create: {
              actorId: user.id,
              action: "REVIEW_REVOKED",
            },
          },
        },
    include: {
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  return ok({
    task: {
      id: updated.id,
      isReviewed: updated.reviewedById !== null,
      reviewedBy: updated.reviewedBy,
      reviewedAt: updated.reviewedAt,
      reviewNotes: updated.reviewNotes,
    },
  });
});