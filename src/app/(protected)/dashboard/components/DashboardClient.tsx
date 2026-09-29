// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/dashboard/components/DashboardClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  FolderKanban,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import type { DashboardData } from "../page";

interface DashboardClientProps {
  data: DashboardData;
}

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// Priority pills mapped to your --gw-* semantic vars
const priorityStyles: Record<string, string> = {
  LOW: "bg-[var(--gw-bg3)] text-[var(--gw-muted)] border border-[var(--gw-border)]",
  MEDIUM: "bg-[var(--gw-cyan-bg)] text-[var(--gw-cyan)] border border-[var(--gw-cyan-dim)]",
  HIGH: "bg-[var(--gw-amber-bg)] text-[var(--gw-amber)] border border-[var(--gw-amber-dim)]",
  URGENT: "bg-[var(--gw-red-bg)] text-[var(--gw-red)] border border-[var(--gw-red-dim)]",
};

const actionLabels: Record<string, string> = {
  CREATED: "created a task",
  UPDATED: "updated a task",
  REVIEWED: "reviewed a task",
  COMMENTED: "commented on a task",
};

export function DashboardClient({ data }: DashboardClientProps) {
  const router = useRouter();
  const {
    stats,
    pendingReviewTasks,
    recentActivity,
    recentTasks,
    groupTaskCounts,
  } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--gw-fern-bg)] border border-[var(--gw-fern-dim)] rounded-xl flex items-center justify-center">
          <LayoutDashboard size={20} className="text-[var(--gw-fern-text)]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--gw-text)]">
            Dashboard
          </h2>
          <p className="text-sm text-[var(--gw-sub)]">
            Overview of team tasks
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks size={16} className="text-[var(--gw-fern-text)]" />
            <span className="text-xs text-[var(--gw-muted)]">
              Total Tasks
            </span>
          </div>
          <p className="text-2xl font-bold text-[var(--gw-text)]">
            {stats.totalTasks}
          </p>
          <p className="text-xs text-[var(--gw-muted)] mt-1">
            {stats.totalUsers} users · {stats.totalGroups} groups
          </p>
        </div>

        <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-[var(--gw-amber)]" />
            <span className="text-xs text-[var(--gw-muted)]">
              Pending Review
            </span>
          </div>
          <p className="text-2xl font-bold text-[var(--gw-amber)]">
            {stats.pendingReview}
          </p>
          <p className="text-xs text-[var(--gw-muted)] mt-1">
            awaiting admin
          </p>
        </div>

        <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-[var(--gw-fern-text)]" />
            <span className="text-xs text-[var(--gw-muted)]">
              Reviewed
            </span>
          </div>
          <p className="text-2xl font-bold text-[var(--gw-fern-text)]">
            {stats.reviewedTasks}
          </p>
          <p className="text-xs text-[var(--gw-muted)] mt-1">
            {stats.totalTasks > 0
              ? Math.round((stats.reviewedTasks / stats.totalTasks) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-[var(--gw-red)]" />
            <span className="text-xs text-[var(--gw-muted)]">
              Overdue
            </span>
          </div>
          <p className="text-2xl font-bold text-[var(--gw-red)]">
            {stats.overdueTasks}
          </p>
          <p className="text-xs text-[var(--gw-muted)] mt-1">
            past due date
          </p>
        </div>
      </div>

      {/* Pending Review + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Review */}
        <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--gw-border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--gw-text)]">
              Awaiting Review
            </h3>
            <button
              onClick={() => router.push("/tasks?reviewed=false")}
              className="text-xs text-[var(--gw-fern-text)] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-[var(--gw-border)]">
            {pendingReviewTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-[var(--gw-bg2)] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${priorityStyles[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                    {task.group && (
                      <span className="text-[11px] text-[var(--gw-muted)]">
                        {task.group.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[var(--gw-text)] truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--gw-muted)]">
                      by {task.author.name}
                    </span>
                    {task.commentsCount > 0 && (
                      <>
                        <span className="text-xs text-[var(--gw-muted)]">·</span>
                        <span className="text-xs text-[var(--gw-muted)] flex items-center gap-1">
                          <MessageSquare size={10} /> {task.commentsCount}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {task.dueDate && (
                  <span className="text-xs text-[var(--gw-muted)] flex-shrink-0 ml-3">
                    Due {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            ))}
            {pendingReviewTasks.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-[var(--gw-muted)]">
                All caught up 🎉
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--gw-border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--gw-text)]">
              Recent Activity
            </h3>
            <span className="text-xs text-[var(--gw-muted)]">
              Latest
            </span>
          </div>
          <div className="divide-y divide-[var(--gw-border)]">
            {recentActivity.map((a) => (
              <div
                key={a.id}
                onClick={() => router.push(`/tasks/${a.task.id}`)}
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-[var(--gw-bg2)] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--gw-text)] truncate">
                    <span className="font-medium">{a.actor.name}</span>{" "}
                    <span className="text-[var(--gw-sub)]">
                      {actionLabels[a.action] || a.action.toLowerCase()}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--gw-muted)] truncate mt-0.5">
                    {a.task.title}
                  </p>
                </div>
                <span className="text-xs text-[var(--gw-muted)] flex-shrink-0 ml-3">
                  {formatDate(a.createdAt)}
                </span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-[var(--gw-muted)]">
                No activity yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Groups overview */}
      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--gw-border)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--gw-text)]">
            Group Overview
          </h3>
          <span className="text-xs text-[var(--gw-muted)]">
            What each team is doing
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          {groupTaskCounts.map((g) => (
            <div
              key={g.id}
              onClick={() => router.push(`/tasks?group=${g.id}`)}
              className="border border-[var(--gw-border)] rounded-xl p-4 cursor-pointer hover:bg-[var(--gw-bg2)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban size={16} className="text-[var(--gw-fern-text)]" />
                <p className="text-sm font-medium text-[var(--gw-text)] truncate">
                  {g.name}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--gw-muted)]">
                <span className="flex items-center gap-1">
                  <ListChecks size={12} /> {g.taskCount} tasks
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {g.memberCount} members
                </span>
              </div>
            </div>
          ))}
          {groupTaskCounts.length === 0 && (
            <div className="col-span-full px-5 py-8 text-center text-sm text-[var(--gw-muted)]">
              No groups yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--gw-border)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--gw-text)]">
            Recent Tasks
          </h3>
          <button
            onClick={() => router.push("/tasks")}
            className="text-xs text-[var(--gw-fern-text)] hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="divide-y divide-[var(--gw-border)]">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => router.push(`/tasks/${task.id}`)}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-[var(--gw-bg2)] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${priorityStyles[task.priority]}`}
                >
                  {task.priority}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--gw-text)] truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-[var(--gw-muted)]">
                    by {task.author.name}
                    {task.group ? ` · ${task.group.name}` : ""}
                    {task.isReviewed ? " · reviewed" : " · pending review"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-[var(--gw-muted)] flex-shrink-0 ml-3">
                {formatDate(task.createdAt)}
              </span>
            </div>
          ))}
          {recentTasks.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-[var(--gw-muted)]">
              No tasks yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}