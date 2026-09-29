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

const priorityStyles: Record<string, string> = {
  LOW: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  MEDIUM: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  HIGH: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  URGENT: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
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
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
          <LayoutDashboard size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Overview of team tasks
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks size={16} className="text-indigo-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Tasks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.totalUsers} users · {stats.totalGroups} groups
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Pending Review</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pendingReview}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            awaiting admin
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Reviewed</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.reviewedTasks}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.totalTasks > 0
              ? Math.round((stats.reviewedTasks / stats.totalTasks) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.overdueTasks}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">past due date</p>
        </div>
      </div>

      {/* Pending Review + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Review */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Awaiting Review
            </h3>
            <button
              onClick={() => router.push("/tasks?reviewed=false")}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {pendingReviewTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${priorityStyles[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                    {task.group && (
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {task.group.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      by {task.author.name}
                    </span>
                    {task.commentsCount > 0 && (
                      <>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MessageSquare size={10} /> {task.commentsCount}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {task.dueDate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-3">
                    Due {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            ))}
            {pendingReviewTasks.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                All caught up 🎉
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Latest</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentActivity.map((a) => (
              <div
                key={a.id}
                onClick={() => router.push(`/tasks/${a.task.id}`)}
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    <span className="font-medium">{a.actor.name}</span>{" "}
                    <span className="text-gray-500 dark:text-gray-400">
                      {actionLabels[a.action] || a.action.toLowerCase()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {a.task.title}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-3">
                  {formatDate(a.createdAt)}
                </span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No activity yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Groups overview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Group Overview
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            What each team is doing
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          {groupTaskCounts.map((g) => (
            <div
              key={g.id}
              onClick={() => router.push(`/tasks?group=${g.id}`)}
              className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban size={16} className="text-indigo-500" />
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {g.name}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
            <div className="col-span-full px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No groups yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Recent Tasks
          </h3>
          <button
            onClick={() => router.push("/tasks")}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => router.push(`/tasks/${task.id}`)}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${priorityStyles[task.priority]}`}
                >
                  {task.priority}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    by {task.author.name}
                    {task.group ? ` · ${task.group.name}` : ""}
                    {task.isReviewed ? " · reviewed" : " · pending review"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-3">
                {formatDate(task.createdAt)}
              </span>
            </div>
          ))}
          {recentTasks.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No tasks yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}