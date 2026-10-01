// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/groups/[id]/projects/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok, fail } from "@/lib/api/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { createProjectSchema } from "@/lib/validations/project";
import { canViewGroup, canCreateProject } from "@/lib/permissions/group";

export const GET = apiHandler<{ id: string }>(async (_req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id: groupId } = await ctx.params;

  const allowed = await canViewGroup(user, groupId);
  if (!allowed) return fail(403, "Forbidden");

  const projects = await prisma.project.findMany({
    where: { groupId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      lead: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
    },
  });

  return ok({
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      lead: p.lead,
      startDate: p.startDate,
      dueDate: p.dueDate,
      taskCount: p._count.tasks,
      createdAt: p.createdAt,
    })),
  });
});

export const POST = apiHandler<{ id: string }>(async (req, ctx) => {
  const user = await getUser();
  if (!user) return fail(401, "Unauthorized");

  const { id: groupId } = await ctx.params;

  const allowed = await canCreateProject(user, groupId);
  if (!allowed)
    return fail(403, "Only admin or the team leader can create projects");

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return fail(404, "Group not found");

  const body = await req.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success)
    return fail(400, "Invalid input", parsed.error.flatten());

  const { name, description, status, leadId, startDate, dueDate } =
    parsed.data;

  if (leadId) {
    const membership = await prisma.userGroup.findUnique({
      where: { userId_groupId: { userId: leadId, groupId } },
    });
    if (!membership) {
      return fail(400, "Project lead must be a member of the group");
    }
  }

  const existing = await prisma.project.findUnique({
    where: { groupId_name: { groupId, name } },
  });
  if (existing) return fail(409, "A project with that name already exists");

  const project = await prisma.project.create({
    data: {
      name,
      description: description ?? null,
      status,
      leadId: leadId ?? null,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      groupId,
    },
    include: {
      lead: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
    },
  });

  return ok({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      lead: project.lead,
      startDate: project.startDate,
      dueDate: project.dueDate,
      taskCount: 0,
      createdAt: project.createdAt,
    },
  });
});