// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/templates/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from "zod";
import { apiHandler, getBody, getPagination } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { ok, created, unauthorized } from "@/lib/api/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const GET = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return unauthorized();

  const { page, limit, skip } = getPagination(req);

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where: { userId: user.id, isArchived: false },
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { labels: true } } },
    }),
    prisma.template.count({ where: { userId: user.id, isArchived: false } }),
  ]);

  return ok({
    templates,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const createSchema = z.object({
  name: z.string().min(1),
  width: z.number(),
  height: z.number(),
  layout: z.any(),
  description: z.string().optional(),
});

export const POST = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return unauthorized();

  const body = await getBody(req);
  const result = validate(createSchema, body);
  if (!result.success) return result.response;

  const template = await prisma.template.create({
    data: { ...result.data, userId: user.id },
  });

  return created(template);
});