// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/users/[id]/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser, hashPassword } from "@/lib/auth";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

export const GET = apiHandler(async (_req, ctx: Ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  if (user.role !== "ADMIN") return fail(403, "Admin only");

  const { id } = await ctx.params;

  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      userGroups: {
        include: { group: { select: { id: true, name: true } } },
      },
      _count: { select: { tasks: true } },
    },
  });

  if (!target) return fail(404, "User not found");

  return ok({
    user: {
      id: target.id,
      name: target.name,
      email: target.email,
      role: target.role,
      createdAt: target.createdAt,
      taskCount: target._count.tasks,
      groups: target.userGroups.map((ug) => ({
        id: ug.group.id,
        name: ug.group.name,
      })),
    },
  });
});

export const PATCH = apiHandler(async (req, ctx: Ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  if (user.role !== "ADMIN") return fail(403, "Admin only");

  const { id } = await ctx.params;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return fail(404, "User not found");

  const body = await req.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const { name, email, password, role } = parsed.data;

  if (email && email !== existing.email) {
    const clash = await prisma.user.findUnique({ where: { email } });
    if (clash) return fail(409, "Email already in use");
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (role !== undefined) data.role = role;
  if (password) data.passwordHash = await hashPassword(password);

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true },
  });

  return ok({ user: updated });
});

export const DELETE = apiHandler(async (_req, ctx: Ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  if (user.role !== "ADMIN") return fail(403, "Admin only");

  const { id } = await ctx.params;

  if (id === user.id) return fail(400, "You cannot delete your own account");

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return fail(404, "User not found");

  await prisma.user.delete({ where: { id } });

  return ok({ deleted: true, id });
});