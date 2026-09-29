// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/tasks/components/TasksClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ListChecks,
  Plus,
  Search,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Divider } from "@/components/ui/Divider";
import { StatusBadge } from "@/components/ui/MethodBadge";
import { useToast } from "@/components/ui/Toast";
import { deriveTaskStatus } from "@/lib/task-status";
import type {
  TaskRow,
  TasksListResponse,
  GroupOption,
} from "../page";

interface Props {
  initial: TasksListResponse | null;
  groups: GroupOption[];
}

type Priority = TaskRow["priority"];

const priorityVariant: Record<Priority, "muted" | "cyan" | "amber" | "red"> = {
  LOW: "muted",
  MEDIUM: "cyan",
  HIGH: "amber",
  URGENT: "red",
};

const formatDate = (v: string | null) =>
  v
    ? new Date(v).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

export function TasksClient({ initial, groups }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [data, setData] = useState<TasksListResponse | null>(initial);
  const [loading, setLoading] = useState(false);

  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [priority, setPriority] = useState<string>("");
  const [groupFilter, setGroupFilter] = useState<string>("");
  const [reviewed, setReviewed] = useState<string>("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const debouncedQ = useDebounce(q, 350);
  const firstRender = useRef(true);

  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set("scope", scope);
    if (priority) qs.set("priority", priority);
    if (groupFilter) qs.set("groupId", groupFilter);
    if (reviewed) qs.set("reviewed", reviewed);
    if (debouncedQ) qs.set("q", debouncedQ);
    qs.set("page", String(page));
    return qs.toString();
  }, [scope, priority, groupFilter, reviewed, debouncedQ, page]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?${queryString}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json?.data) {
        throw new Error(json?.message || "Failed to load tasks");
      }
      setData(json.data);
    } catch (err) {
      toast.error(
        "Load failed",
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  }, [queryString, toast]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    refresh();
  }, [refresh]);

  useEffect(() => {
    setPage(1);
  }, [scope, priority, groupFilter, reviewed, debouncedQ]);

  const tasks = data?.tasks ?? [];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--gw-fern-bg)] border border-[var(--gw-fern-dim)] rounded-xl flex items-center justify-center">
            <ListChecks size={18} className="text-[var(--gw-fern-text)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--gw-text)]">
              Tasks
            </h2>
            <p className="text-sm text-[var(--gw-sub)]">
              {data?.total ?? 0} task{data?.total === 1 ? "" : "s"}
              {scope === "mine" ? " · your tasks" : " · all tasks"}
            </p>
          </div>
        </div>
        <Button
          icon={<Plus size={14} />}
          onClick={() => router.push("/tasks/new")}
        >
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="Search"
            placeholder="Search title or description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            prefixNode={
              <Search size={13} className="text-[var(--gw-muted)]" />
            }
          />

          <Select
            label="Scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as "mine" | "all")}
            options={[
              { value: "mine", label: "My tasks" },
              { value: "all", label: "All tasks (admin)" },
            ]}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: "", label: "Any priority" },
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
              { value: "URGENT", label: "Urgent" },
            ]}
          />

          <Select
            label="Review"
            value={reviewed}
            onChange={(e) => setReviewed(e.target.value)}
            options={[
              { value: "", label: "Any" },
              { value: "false", label: "Pending review" },
              { value: "true", label: "Reviewed" },
            ]}
          />
        </div>

        {groups.length > 0 && (
          <>
            <Divider label="Group" />
            <div className="flex flex-wrap gap-2">
              <FilterPill
                active={!groupFilter}
                onClick={() => setGroupFilter("")}
                label="All groups"
              />
              {groups.map((g) => (
                <FilterPill
                  key={g.id}
                  active={groupFilter === g.id}
                  onClick={() => setGroupFilter(g.id)}
                  label={g.name}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* List */}
      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl overflow-hidden">
        {loading && (
          <div className="px-5 py-3 border-b border-[var(--gw-border)] text-xs font-mono text-[var(--gw-muted)]">
            Loading…
          </div>
        )}

        {tasks.length === 0 && !loading && (
          <div className="px-5 py-16 text-center">
            <ListChecks
              size={28}
              className="mx-auto text-[var(--gw-muted)] mb-3"
            />
            <p className="font-mono text-[13px] text-[var(--gw-sub)] mb-1">
              No tasks found
            </p>
            <p className="font-mono text-[11px] text-[var(--gw-muted)] mb-4">
              Adjust your filters or create your first task.
            </p>
            <Button
              size="sm"
              icon={<Plus size={12} />}
              onClick={() => router.push("/tasks/new")}
            >
              Create Task
            </Button>
          </div>
        )}

        <div className="divide-y divide-[var(--gw-border)]">
          {tasks.map((task) => (
            <TaskRowItem
              key={task.id}
              task={task}
              onClick={() => router.push(`/tasks/${task.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-[var(--gw-muted)]">
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Row
// ─────────────────────────────────────────────

function TaskRowItem({
  task,
  onClick,
}: {
  task: TaskRow;
  onClick: () => void;
}) {
  const status = deriveTaskStatus({
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    isReviewed: task.isReviewed,
  });

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-[var(--gw-bg2)] transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge variant={priorityVariant[task.priority]}>
            {task.priority}
          </Badge>
          <StatusBadge status={status} />
          {task.group && (
            <span className="font-mono text-[11px] text-[var(--gw-muted)]">
              {task.group.name}
            </span>
          )}
        </div>

        <p className="font-mono text-[13px] text-[var(--gw-text)] truncate">
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-[11px] text-[var(--gw-muted)]">
            by {task.author.name}
          </span>
          {task.commentsCount > 0 && (
            <>
              <span className="text-[var(--gw-muted)]">·</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--gw-muted)]">
                <MessageSquare size={10} /> {task.commentsCount}
              </span>
            </>
          )}
        </div>
      </div>

      {task.dueDate && (
        <div className="flex items-center gap-1.5 text-[var(--gw-muted)] flex-shrink-0">
          <Calendar size={12} />
          <span className="font-mono text-[11px]">
            {formatDate(task.dueDate)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Filter pill
// ─────────────────────────────────────────────

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-[3px] border transition-all duration-150 ${
        active
          ? "bg-[var(--gw-fern-bg)] border-[var(--gw-fern-dim)] text-[var(--gw-fern-text)]"
          : "bg-transparent border-[var(--gw-border)] text-[var(--gw-muted)] hover:border-[var(--gw-border-hi)] hover:text-[var(--gw-sub)]"
      }`}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// Debounce hook
// ─────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}