// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/projects/[id]/components/ProjectDetailClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FolderKanban,
  ListChecks,
  Users,
  Crown,
  Save,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/MethodBadge";
import { useToast } from "@/components/ui/Toast";
import { deriveTaskStatus } from "@/lib/task-status";
import type { ProjectDetail } from "../page";

type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const PROJECT_STATUS_OPTIONS = (
  Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]
).map((s) => ({ value: s, label: PROJECT_STATUS_LABELS[s] }));

const projectStatusVariant: Record<
  ProjectStatus,
  "muted" | "cyan" | "amber" | "green" | "red"
> = {
  PLANNING: "muted",
  ACTIVE: "cyan",
  ON_HOLD: "amber",
  COMPLETED: "green",
  CANCELLED: "red",
};

const priorityVariant: Record<
  ProjectDetail["tasks"][number]["priority"],
  "muted" | "cyan" | "amber" | "red"
> = {
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

interface Props {
  project: ProjectDetail;
  currentUser: { id: string; role: "ADMIN" | "USER" };
}

export function ProjectDetailClient({ project: initial, currentUser }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [project, setProject] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setSavingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [leadId, setLeadId] = useState(project.lead?.id ?? "");
  const [startDate, setStartDate] = useState(
    project.startDate ? project.startDate.slice(0, 10) : ""
  );
  const [dueDate, setDueDate] = useState(
    project.dueDate ? project.dueDate.slice(0, 10) : ""
  );

  const isAdmin = currentUser.role === "ADMIN";
  const isLead = project.lead?.id === currentUser.id;
  const isGroupTL = project.group.leader?.id === currentUser.id;
  const canEdit = isAdmin || isLead || isGroupTL;

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          status,
          leadId: leadId || null,
          startDate: startDate || null,
          dueDate: dueDate || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.project) {
        throw new Error(json?.message || "Failed to save");
      }
      setProject((p) => ({ ...p, ...json.data.project }));
      toast.success("Project updated");
      setEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error("Save failed", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`))
      return;
    setSavingDelete(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to delete");
      toast.success("Project deleted");
      router.push(`/groups/${project.group.id}`);
    } catch (err) {
      toast.error(
        "Delete failed",
        err instanceof Error ? err.message : "Unknown"
      );
    } finally {
      setSavingDelete(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push(`/groups/${project.group.id}`)}
            className="w-8 h-8 rounded-lg border border-gw-border flex items-center justify-center text-gw-sub hover:text-gw-text hover:border-gw-border-hi transition-colors flex-shrink-0"
          >
            <ArrowLeft size={14} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <FolderKanban size={14} className="text-gw-fern-text" />
              <h2 className="text-lg font-semibold text-gw-text truncate">
                {project.name}
              </h2>
              <Badge variant={projectStatusVariant[project.status]} dot={false}>
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
              {project.lead && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gw-fern-text">
                  <Crown size={11} /> {project.lead.name}
                </span>
              )}
            </div>
            <p className="text-sm text-gw-sub truncate">
              in{" "}
              <span
                className="text-gw-fern-text cursor-pointer hover:underline"
                onClick={() => router.push(`/groups/${project.group.id}`)}
              >
                {project.group.name}
              </span>
            </p>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? "Cancel" : "Edit"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              loading={deleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Info / Edit */}
      <Card className="p-5 flex flex-col gap-4">
        {!editing ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetaItem
                icon={<Crown size={13} />}
                label="Lead"
                value={project.lead?.name ?? "—"}
              />
              <MetaItem
                icon={<Calendar size={13} />}
                label="Start"
                value={formatDate(project.startDate)}
              />
              <MetaItem
                icon={<Calendar size={13} />}
                label="Due"
                value={formatDate(project.dueDate)}
              />
              <MetaItem
                icon={<ListChecks size={13} />}
                label="Tasks"
                value={String(project.tasks.length)}
              />
            </div>
            {project.description && (
              <div>
                <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-gw-sub mb-2">
                  Description
                </p>
                <p className="font-mono text-[13px] text-gw-sub leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                options={PROJECT_STATUS_OPTIONS}
              />
              <Select
                label="Lead"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                options={[
                  { value: "", label: "No lead" },
                  ...project.members.map((m) => ({
                    value: m.id,
                    label: `${m.name} · ${m.email}`,
                  })),
                ]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-2 border-t border-gw-border">
              <Button
                icon={<Save size={13} />}
                loading={saving}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Tasks */}
      <Card className="flex flex-col">
        <div className="px-5 py-3.5 border-b border-gw-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks size={14} className="text-gw-sub" />
            <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-gw-sub">
              Tasks ({project.tasks.length})
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={<Plus size={12} />}
            onClick={() => router.push(`/tasks/new?projectId=${project.id}`)}
          >
            New Task
          </Button>
        </div>

        {project.tasks.length === 0 ? (
          <p className="px-5 py-6 font-mono text-[12px] text-gw-muted">
            No tasks in this project yet.
          </p>
        ) : (
          <div className="divide-y divide-gw-border">
            {project.tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => router.push(`/tasks/${t.id}`)}
                className="flex items-center justify-between gap-2 px-5 py-3 cursor-pointer hover:bg-gw-bg2 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant={priorityVariant[t.priority]}>
                    {t.priority}
                  </Badge>
                  <StatusBadge
                    status={deriveTaskStatus({
                      dueDate: null,
                      completedAt: null,
                      isReviewed: t.isReviewed,
                    })}
                  />
                  <span className="font-mono text-[12px] text-gw-text truncate">
                    {t.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {t.assignee && (
                    <span className="font-mono text-[10px] text-gw-fern-text">
                      → {t.assignee.name}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-gw-muted">
                    by {t.authorName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Members of the parent group */}
      <Card className="flex flex-col">
        <div className="px-5 py-3.5 border-b border-gw-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-gw-sub" />
            <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-gw-sub">
              Group Members ({project.members.length})
            </p>
          </div>
          <span className="font-mono text-[10px] text-gw-muted">
            from {project.group.name}
          </span>
        </div>
        <div className="divide-y divide-gw-border">
          {project.members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 px-5 py-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-gw-bg3 flex items-center justify-center font-mono text-[11px] text-gw-sub flex-shrink-0">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[12px] text-gw-text truncate">
                  {m.name}
                </p>
                <p className="font-mono text-[10px] text-gw-muted truncate">
                  {m.email}
                </p>
              </div>
              <span className="font-mono text-[10px] text-gw-muted">
                {m.groupRole.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </Card>
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
      <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] uppercase text-gw-muted">
        {icon} {label}
      </span>
      <span className="font-mono text-[13px] text-gw-text truncate">
        {value}
      </span>
    </div>
  );
}