// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/activity/components/ActivityClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity as ActivityIcon,
  Plus,
  CheckCircle2,
  Edit3,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { ActivityRow } from "../page";

interface ActivityListResponse {
  activity: ActivityRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface Props {
  initial: ActivityListResponse | null;
  isAdmin: boolean;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  CREATED: Plus,
  UPDATED: Edit3,
  REVIEWED: CheckCircle2,
  REVIEW_REVOKED: Edit3,
  COMMENTED: MessageSquare,
};

const ACTION_LABELS: Record<string, string> = {
  CREATED: "created a task",
  UPDATED: "updated a task",
  REVIEWED: "reviewed a task",
  REVIEW_REVOKED: "revoked a review",
  COMMENTED: "commented on a task",
};

const formatDate = (v: string) =>
  new Date(v).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function ActivityClient({ initial, isAdmin }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [data, setData] = useState<ActivityListResponse | null>(initial);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<string>("");
  const [page, setPage] = useState(1);

  const firstRender = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (action) qs.set("action", action);
      qs.set("page", String(page));
      const res = await fetch(`/api/activity?${qs.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json?.data) {
        throw new Error(json?.message || "Failed to load activity");
      }
      setData(json.data);
    } catch (err) {
      toast.error(
        "Load failed",
        err instanceof Error ? err.message : "Unknown"
      );
    } finally {
      setLoading(false);
    }
  }, [action, page, toast]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    refresh();
  }, [refresh]);

  const handleActionChange = (next: string) => {
    setAction(next);
    setPage(1);
  };

  const activity = data?.activity ?? [];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gw-fern-bg border border-gw-fern-dim rounded-xl flex items-center justify-center">
            <ActivityIcon size={18} className="text-gw-fern-text" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gw-text">Activity</h2>
            <p className="text-sm text-gw-sub">
              {data?.total ?? 0} events
              {isAdmin ? " · across all users" : " · on your tasks"}
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-gw-bg1 border border-gw-border rounded-xl p-4">
        <Select
          label="Action"
          value={action}
          onChange={(e) => handleActionChange(e.target.value)}
          options={[
            { value: "", label: "All actions" },
            { value: "CREATED", label: "Created" },
            { value: "UPDATED", label: "Updated" },
            { value: "REVIEWED", label: "Reviewed" },
            { value: "COMMENTED", label: "Commented" },
          ]}
        />
      </div>

      {/* List */}
      <div className="bg-gw-bg1 border border-gw-border rounded-xl overflow-hidden">
        {loading && (
          <div className="px-5 py-3 border-b border-gw-border text-xs font-mono text-gw-muted">
            Loading…
          </div>
        )}

        {activity.length === 0 && !loading && (
          <div className="px-5 py-16 text-center">
            <ActivityIcon
              size={28}
              className="mx-auto text-gw-muted mb-3"
            />
            <p className="font-mono text-[13px] text-gw-sub">
              No activity yet
            </p>
          </div>
        )}

        <div className="divide-y divide-gw-border">
          {activity.map((a) => {
            const Icon = ACTION_ICONS[a.action] ?? Clock;
            const label = ACTION_LABELS[a.action] ?? a.action.toLowerCase();
            return (
              <div
                key={a.id}
                onClick={() => router.push(`/tasks/${a.task.id}`)}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-gw-bg2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gw-bg3 flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-gw-sub" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[12px] text-gw-text">
                    <span className="text-gw-sub">{a.actor.name}</span>{" "}
                    {label}
                  </p>
                  <p className="font-mono text-[11px] text-gw-muted truncate mt-0.5">
                    {a.task.title}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {a.actor.role === "ADMIN" && (
                    <Badge variant="green" dot={false}>
                      Admin
                    </Badge>
                  )}
                  <span className="font-mono text-[10px] text-gw-muted">
                    {formatDate(a.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-gw-muted">
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