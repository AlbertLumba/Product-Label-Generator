// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/dashboard/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/server";
import prisma from "@/lib/prisma";

export const GET = apiHandler(async () => {
  // ── Task stats ──
  const totalTasks = await prisma.task.count();
  const reviewedTasks = await prisma.task.count({
    where: { reviewedById: { not: null } },
  });
  const pendingReview = await prisma.task.count({
    where: { reviewedById: null },
  });
  const overdueTasks = await prisma.task.count({
    where: {
      dueDate: { lt: new Date() },
      completedAt: null,
    },
  });

  // ── Priority breakdown ──
  const priorityCounts = await prisma.task.groupBy({
    by: ["priority"],
    _count: true,
  });

  const priorityStats = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    URGENT: 0,
  } as Record<string, number>;
  for (const p of priorityCounts) {
    priorityStats[p.priority] = p._count;
  }

  // ── Group + user counts ──
  const totalGroups = await prisma.group.count();
  const totalUsers = await prisma.user.count({ where: { role: "USER" } });

  // ── Tasks awaiting admin review (top 5, oldest first) ──
  const pendingReviewTasks = await prisma.task.findMany({
    where: { reviewedById: null },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    take: 5,
    include: {
      author: { select: { id: true, name: true, email: true } },
      group: { select: { id: true, name: true } },
      _count: { select: { comments: true, activityLogs: true } },
    },
  });

  // ── Recent activity (latest 5 activity logs) ──
  const recentActivity = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      actor: { select: { id: true, name: true, role: true } },
      task: { select: { id: true, title: true } },
    },
  });

  // ── Recent tasks (latest 5) ──
  const recentTasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      author: { select: { id: true, name: true, email: true } },
      group: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
      _count: { select: { comments: true, activityLogs: true } },
    },
  });

  // ── Per-group task counts (for the "what is each group doing" view) ──
  const groupTaskCounts = await prisma.group.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { name: "asc" },
  });

  // ── Monthly task creation (last 6 months) ──
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTasks = await prisma.task.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const monthlyData: Record<string, number> = {};
  monthlyTasks.forEach((t) => {
    const key = t.createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    monthlyData[key] = (monthlyData[key] || 0) + 1;
  });

  return ok({
    stats: {
      totalTasks,
      reviewedTasks,
      pendingReview,
      overdueTasks,
      totalGroups,
      totalUsers,
      priorityStats,
    },
    pendingReviewTasks: pendingReviewTasks.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      author: t.author,
      group: t.group,
      commentsCount: t._count.comments,
      activityCount: t._count.activityLogs,
    })),
    recentActivity: recentActivity.map((a) => ({
      id: a.id,
      action: a.action,
      createdAt: a.createdAt,
      actor: a.actor,
      task: a.task,
    })),
    recentTasks: recentTasks.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      author: t.author,
      group: t.group,
      reviewedBy: t.reviewedBy,
      reviewedAt: t.reviewedAt,
      isReviewed: t.reviewedById !== null,
      commentsCount: t._count.comments,
      activityCount: t._count.activityLogs,
    })),
    groupTaskCounts: groupTaskCounts.map((g) => ({
      id: g.id,
      name: g.name,
      taskCount: g._count.tasks,
      memberCount: g._count.members,
    })),
    monthlyData,
  });
});