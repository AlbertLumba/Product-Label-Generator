// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/templates/[id]/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, unauthorized, notFound } from "@/lib/api/types";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const GET = apiHandler(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getUser();
    if (!user) return unauthorized();

    const { id } = await params;
    const template = await prisma.template.findFirst({
      where: { id, userId: user.id },
    });
    if (!template) return notFound("Template not found");

    return ok(template);
  },
);

export const DELETE = apiHandler(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getUser();
    if (!user) return unauthorized();

    const { id } = await params;
    await prisma.template.delete({ where: { id, userId: user.id } });
    return ok(null, "Deleted");
  },
);
