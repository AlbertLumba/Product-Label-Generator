// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/me/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const updateMeSchema = z.object({
  name: z.string().min(1).max(100),
});

export const GET = apiHandler(async () => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  return ok({ user });
});

export const PATCH = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const body = await req.json().catch(() => null);
  const parsed = updateMeSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name.trim() },
    select: { id: true, name: true, email: true, role: true },
  });

  return ok({ user: updated });
});