// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/groups/[id]/candidates/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { canManageRoster } from "@/lib/permissions/group";

export const GET = apiHandler<{ id: string }>(async (req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id: groupId } = await ctx.params;

  // Only admin or the group's TL can query candidates
  const allowed = await canManageRoster(user, groupId);
  if (!allowed) return fail(403, "Forbidden");

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();

  // Find users who are NOT already members of this group
  const users = await prisma.user.findMany({
    where: {
      // Exclude existing members
      userGroups: { none: { groupId } },
      // Optional search
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true, // system-level role (ADMIN/USER) — informational
    },
    orderBy: { name: "asc" },
    take: 50,
  });

  return ok({
    candidates: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      systemRole: u.role,
    })),
  });
});