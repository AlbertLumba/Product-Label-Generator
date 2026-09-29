// src/app/(protected)/tasks/[id]/components/TaskDetailClient.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  MessageSquare,
  Send,
  ShieldCheck,
  User as UserIcon,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";
import type { TaskDetail } from "../page";

const priorityVariant: Record<
  TaskDetail["priority"],
  "muted" | "cyan" | "amber" | "red"
> = {
  LOW: "muted",
  MEDIUM: "cyan",
  HIGH: "amber",
  URGENT: "red",
};

const formatDate = (v: string | null, withTime = false) =>
  v
    ? new Date(v).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...(withTime
          ? { hour: "2-digit", minute: "2-digit" }
          : {}),
      })
    : "—";

export function TaskDetailClient({ task: initialTask }: { task: TaskDetail }) {
  const router = useRouter();
  const toast = useToast();

  const [task, setTask] = useState<TaskDetail>(initialTask);
  const [comment, setComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [reviewNotes, setReviewNotes] = useState(task.reviewNotes ?? "");
  const [reviewing, setReviewing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = task.author.role !== "USER" ? true : false; // you can improve this by passing current user
  // ↑ Replace with real current user check — see note below.

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPostingComment(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: comment.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.comment) {
        throw new Error(json?.message || "Failed to post comment");
      }
      setTask((t) => ({ ...t, comments: [...t.comments, json.data.comment] }));
      setComment("");
      toast.success("Comment posted");
    } catch (err) {
      toast.error("Comment failed", err instanceof Error ? err.message : "Unknown");
    } finally {
      setPostingComment(false);
    }
  };

  const handleReview = async (reviewed: boolean) => {
    setReviewing(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reviewed,
          reviewNotes: reviewNotes.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.task) {
        throw new Error(json?.message || "Failed to review task");
      }
      setTask((t) => ({
        ...t,
        isReviewed: json.data.task.isReviewed,
        reviewedBy: json.data.task.reviewedBy,
        reviewedAt: json.data.task.reviewedAt,
        reviewNotes: json.data.task.reviewNotes,
      }));
      toast.success(reviewed ? "Task approved" : "Review revoked");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error("Review failed", msg);
    } finally {
      setReviewing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to delete");
      toast.success("Task deleted");
      router.push("/tasks");
    } catch (err) {
      toast.error("Delete failed", err instanceof Error ? err.message : "Unknown");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/tasks")}
            className="w-8 h-8 rounded-lg border border-[var(--gw-border)] flex items-center justify-center text-[var(--gw-sub)] hover:text-[var(--gw-text)] hover:border-[var(--gw-border-hi)] transition-colors flex-shrink-0"
          >
            <ArrowLeft size={14} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant={priorityVariant[task.priority]}>
                {task.priority}
              </Badge>
              {task.group && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--gw-muted)]">
                  <FolderKanban size={11} /> {task.group.name}
                </span>
              )}
              {task.isReviewed ? (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--gw-fern-text)]">
                  <CheckCircle2 size={11} /> Reviewed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--gw-amber)]">
                  <Clock size={11} /> Pending review
                </span>
              )}
            </div>
            <h1 className="text-lg font-semibold text-[var(--gw-text)] truncate">
              {task.title}
            </h1>
          </div>
        </div>
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 size={13} />}
          onClick={handleDelete}
          loading={deleting}
        >
          Delete
        </Button>
      </div>

      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Meta card */}
      <Card className="p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetaItem
            icon={<UserIcon size={13} />}
            label="Author"
            value={task.author.name}
          />
          <MetaItem
            icon={<FolderKanban size={13} />}
            label="Group"
            value={task.group?.name ?? "—"}
          />
          <MetaItem
            icon={<Calendar size={13} />}
            label="Due"
            value={formatDate(task.dueDate)}
          />
          <MetaItem
            icon={<Clock size={13} />}
            label="Created"
            value={formatDate(task.createdAt, true)}
          />
        </div>

        {task.description && (
          <>
            <Divider />
            <div>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--gw-sub)] mb-2">
                Description
              </p>
              <p className="font-mono text-[13px] text-[var(--gw-sub)] leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          </>
        )}
      </Card>

      {/* Admin review panel */}
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[var(--gw-fern-text)]" />
          <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-[var(--gw-sub)]">
            Admin Review
          </p>
        </div>

        {task.isReviewed && (
          <div className="bg-[var(--gw-fern-bg)] border border-[var(--gw-fern-dim)] rounded-[4px] p-3 flex flex-col gap-1">
            <p className="font-mono text-[11px] text-[var(--gw-fern-text)]">
              Reviewed by {task.reviewedBy?.name} · {formatDate(task.reviewedAt, true)}
            </p>
            {task.reviewNotes && (
              <p className="font-mono text-[12px] text-[var(--gw-sub)] whitespace-pre-wrap">
                {task.reviewNotes}
              </p>
            )}
          </div>
        )}

        <Textarea
          label="Review notes"
          placeholder="Optional feedback for the author…"
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          rows={3}
        />

        <div className="flex gap-2 justify-end">
          {task.isReviewed && (
            <Button
              variant="outline"
              size="sm"
              loading={reviewing}
              onClick={() => handleReview(false)}
            >
              Revoke Review
            </Button>
          )}
          <Button
            size="sm"
            icon={<CheckCircle2 size={13} />}
            loading={reviewing}
            onClick={() => handleReview(true)}
          >
            {task.isReviewed ? "Update Review" : "Approve"}
          </Button>
        </div>
      </Card>

      {/* Comments */}
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-[var(--gw-sub)]" />
          <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-[var(--gw-sub)]">
            Comments ({task.comments.length})
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {task.comments.length === 0 && (
            <p className="font-mono text-[12px] text-[var(--gw-muted)] py-2">
              No comments yet.
            </p>
          )}
          {task.comments.map((c) => (
            <div
              key={c.id}
              className="bg-[var(--gw-bg2)] border border-[var(--gw-border)] rounded-[4px] p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[12px] text-[var(--gw-text)]">
                  {c.author.name}
                </span>
                {c.author.role === "ADMIN" && (
                  <Badge variant="green" dot={false}>
                    Admin
                  </Badge>
                )}
                <span className="font-mono text-[10px] text-[var(--gw-muted)]">
                  {formatDate(c.createdAt, true)}
                </span>
              </div>
              <p className="font-mono text-[13px] text-[var(--gw-sub)] whitespace-pre-wrap">
                {c.body}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handlePostComment} className="flex flex-col gap-3">
          <Textarea
            placeholder="Add a comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              icon={<Send size={13} />}
              loading={postingComment}
              disabled={!comment.trim()}
            >
              Post
            </Button>
          </div>
        </form>
      </Card>

      {/* Activity log */}
      {task.activityLogs.length > 0 && (
        <Card className="p-5 flex flex-col gap-3">
          <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-[var(--gw-sub)]">
            Activity
          </p>
          <div className="flex flex-col gap-2">
            {task.activityLogs.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 font-mono text-[11px] text-[var(--gw-muted)]"
              >
                <span className="text-[var(--gw-sub)]">{a.actor.name}</span>
                <span>·</span>
                <span>{a.action.toLowerCase()}</span>
                <span>·</span>
                <span>{formatDate(a.createdAt, true)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--gw-muted)]">
        {icon} {label}
      </span>
      <span className="font-mono text-[13px] text-[var(--gw-text)] truncate">
        {value}
      </span>
    </div>
  );
}