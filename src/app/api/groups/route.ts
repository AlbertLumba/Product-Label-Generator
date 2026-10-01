// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/groups/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { createGroupSchema } from "@/lib/validations/group";

export const GET = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "true";

  const groups = await prisma.group.findMany({
    where:
      mine && user.role !== "ADMIN"
        ? { members: { some: { userId: user.id } } }
        : undefined,
    select: {
      id: true,
      name: true,
      description: true,
      leader: { select: { id: true, name: true } },
      _count: { select: { members: true, tasks: true } },
    },
    orderBy: { name: "asc" },
  });

  return ok({
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      leader: g.leader,
      memberCount: g._count.members,
      taskCount: g._count.tasks,
    })),
  });
});

export const POST = apiHandler(async (req) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");
  if (user.role !== "ADMIN") return fail(403, "Admin only");

  const body = await req.json().catch(() => null);
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const { name, description, leaderId } = parsed.data;

  const existing = await prisma.group.findUnique({ where: { name } });
  if (existing) return fail(409, "A group with that name already exists");

  // If a leader was chosen, verify the user exists
  if (leaderId) {
    const leaderUser = await prisma.user.findUnique({
      where: { id: leaderId },
      select: { id: true },
    });
    if (!leaderUser) return fail(404, "Leader user not found");
  }

  const group = await prisma.group.create({
    data: {
      name,
      description: description ?? null,
      leaderId: leaderId ?? null,
      // If a leader is set, upsert their membership as TEAM_LEADER
      ...(leaderId
        ? {
            members: {
              create: [
                {
                  userId: leaderId,
                  role: "TEAM_LEADER",
                },
              ],
            },
          }
        : {}),
    },
    include: {
      leader: { select: { id: true, name: true } },
    },
  });

  return ok({
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      leader: group.leader,
      memberCount: leaderId ? 1 : 0,
      taskCount: 0,
    },
  });
});