// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/groups/[id]/components/GroupDetailClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  ListChecks,
  Trash2,
  UserPlus,
  X,
  Crown,
  Star,
  Search,
  Sparkles,
  FolderKanban,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { IconButton } from "@/components/ui/IconButton";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/ui/MethodBadge";
import { deriveTaskStatus } from "@/lib/task-status";
import type {
  GroupDetail,
  GroupMember,
  ProjectSummary,
} from "../page";

// ─────────────────────────────────────────────
// Types & maps
// ─────────────────────────────────────────────

type GroupRole =
  | "TEAM_LEADER"
  | "SUB_TEAM_LEADER"
  | "FRONTEND"
  | "BACKEND"
  | "PRODUCT_SPECIALIST"
  | "MEMBER";

type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

const GROUP_ROLE_LABELS: Record<GroupRole, string> = {
  TEAM_LEADER: "Team Leader",
  SUB_TEAM_LEADER: "Sub-Leader",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  PRODUCT_SPECIALIST: "Product Specialist",
  MEMBER: "Member",
};

const GROUP_ROLE_OPTIONS = (
  Object.keys(GROUP_ROLE_LABELS) as GroupRole[]
).map((r) => ({ value: r, label: GROUP_ROLE_LABELS[r] }));

const TL_ASSIGNABLE_OPTIONS = GROUP_ROLE_OPTIONS.filter(
  (o) => o.value !== "TEAM_LEADER"
);

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
  GroupDetail["tasks"][number]["priority"],
  "muted" | "cyan" | "amber" | "red"
> = {
  LOW: "muted",
  MEDIUM: "cyan",
  HIGH: "amber",
  URGENT: "red",
};

interface Props {
  group: GroupDetail;
  currentUser: { id: string; role: "ADMIN" | "USER" };
  myGroupRole: GroupRole | null;
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export function GroupDetailClient({
  group: initial,
  currentUser,
  myGroupRole,
}: Props) {
  const router = useRouter();
  const toast = useToast();

  const [group, setGroup] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = currentUser.role === "ADMIN";
  const isTL = myGroupRole === "TEAM_LEADER";
  const canManageRoster = isAdmin || isTL;
  const canCreateProject = canManageRoster;

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this group?`)) return;
    try {
      const res = await fetch(`/api/groups/${group.id}/members/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to remove");
      setGroup((g) => ({
        ...g,
        members: g.members.filter((m) => m.id !== userId),
      }));
      toast.success("Member removed", name);
    } catch (err) {
      toast.error(
        "Remove failed",
        err instanceof Error ? err.message : "Unknown"
      );
    }
  };

  const handleChangeRole = async (
    userId: string,
    role: GroupRole,
    name: string
  ) => {
    try {
      const res = await fetch(`/api/groups/${group.id}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.member) {
        throw new Error(json?.message || "Failed to change role");
      }
      setGroup((g) => ({
        ...g,
        members: g.members.map((m) =>
          m.id === userId ? { ...m, groupRole: role } : m
        ),
      }));
      toast.success(`${name} is now ${GROUP_ROLE_LABELS[role]}`);
    } catch (err) {
      toast.error(
        "Role change failed",
        err instanceof Error ? err.message : "Unknown"
      );
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm(`Delete group "${group.name}"? This cannot be undone.`))
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to delete");
      toast.success("Group deleted");
      router.push("/groups");
    } catch (err) {
      toast.error(
        "Delete failed",
        err instanceof Error ? err.message : "Unknown"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/groups")}
            className="w-8 h-8 rounded-lg border border-gw-border flex items-center justify-center text-gw-sub hover:text-gw-text hover:border-gw-border-hi transition-colors flex-shrink-0"
          >
            <ArrowLeft size={14} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h2 className="text-lg font-semibold text-gw-text truncate">
                {group.name}
              </h2>
              {group.leader && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gw-fern-text">
                  <Crown size={11} /> {group.leader.name}
                </span>
              )}
            </div>
            {group.description && (
              <p className="text-sm text-gw-sub truncate">
                {group.description}
              </p>
            )}
          </div>
        </div>
        {canManageRoster && (
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={<UserPlus size={13} />}
              onClick={() => setAdding(true)}
            >
              Add Member
            </Button>
            {isAdmin && (
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={13} />}
                loading={deleting}
                onClick={handleDeleteGroup}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {adding && (
        <AddMemberModal
          groupId={group.id}
          isAdmin={isAdmin}
          onClose={() => setAdding(false)}
          onAdded={(member) => {
            setGroup((g) => ({ ...g, members: [...g.members, member] }));
            setAdding(false);
          }}
        />
      )}

      {creatingProject && (
        <CreateProjectModal
          groupId={group.id}
          members={group.members}
          onClose={() => setCreatingProject(false)}
          onCreated={(project) => {
            setGroup((g) => ({ ...g, projects: [project, ...g.projects] }));
            setCreatingProject(false);
          }}
        />
      )}

      {/* Projects */}
      <Card className="flex flex-col">
        <div className="px-5 py-3.5 border-b border-gw-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban size={14} className="text-gw-sub" />
            <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-gw-sub">
              Projects ({group.projects.length})
            </p>
          </div>
          {canCreateProject && (
            <Button
              size="sm"
              variant="outline"
              icon={<Plus size={12} />}
              onClick={() => setCreatingProject(true)}
            >
              New Project
            </Button>
          )}
        </div>

        {group.projects.length === 0 ? (
          <p className="px-5 py-6 font-mono text-[12px] text-gw-muted">
            No projects yet.
          </p>
        ) : (
          <div className="divide-y divide-gw-border">
            {group.projects.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/projects/${p.id}`)}
                className="flex items-center justify-between gap-3 px-5 py-3 cursor-pointer hover:bg-gw-bg2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-mono text-[13px] text-gw-text truncate">
                      {p.name}
                    </span>
                    <Badge variant={projectStatusVariant[p.status]} dot={false}>
                      {PROJECT_STATUS_LABELS[p.status]}
                    </Badge>
                    {p.lead && (
                      <span className="font-mono text-[10px] text-gw-fern-text">
                        Lead: {p.lead.name}
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="font-mono text-[10px] text-gw-muted truncate">
                      {p.description}
                    </p>
                  )}
                </div>
                <span className="font-mono text-[10px] text-gw-muted flex-shrink-0">
                  {p.taskCount} task{p.taskCount === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Members */}
      <Card className="flex flex-col">
        <div className="px-5 py-3.5 border-b border-gw-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-gw-sub" />
            <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-gw-sub">
              Members ({group.members.length})
            </p>
          </div>
        </div>

        {group.members.length === 0 ? (
          <p className="px-5 py-6 font-mono text-[12px] text-gw-muted">
            No members yet.
          </p>
        ) : (
          <div className="divide-y divide-gw-border">
            {group.members.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                isAdmin={isAdmin}
                isSelf={m.id === currentUser.id}
                isLeader={group.leader?.id === m.id}
                canManageRoster={canManageRoster}
                onChangeRole={(role) => handleChangeRole(m.id, role, m.name)}
                onRemove={() => handleRemoveMember(m.id, m.name)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Tasks */}
      <Card className="flex flex-col">
        <div className="px-5 py-3.5 border-b border-gw-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks size={14} className="text-gw-sub" />
            <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-gw-sub">
              Tasks ({group.tasks.length})
            </p>
          </div>
        </div>

        {group.tasks.length === 0 ? (
          <p className="px-5 py-6 font-mono text-[12px] text-gw-muted">
            No tasks in this group yet.
          </p>
        ) : (
          <div className="divide-y divide-gw-border">
            {group.tasks.map((t) => (
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
                  {t.project && (
                    <span className="font-mono text-[10px] text-gw-muted truncate">
                      · {t.project.name}
                    </span>
                  )}
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
    </div>
  );
}

// ─────────────────────────────────────────────
// Member row
// ─────────────────────────────────────────────

function MemberRow({
  member,
  isAdmin,
  isSelf,
  isLeader,
  canManageRoster,
  onChangeRole,
  onRemove,
}: {
  member: GroupMember;
  isAdmin: boolean;
  isSelf: boolean;
  isLeader: boolean;
  canManageRoster: boolean;
  onChangeRole: (role: GroupRole) => void;
  onRemove: () => void;
}) {
  const role = member.groupRole;
  const isMemberTL = role === "TEAM_LEADER";
  const isMemberSubLead = role === "SUB_TEAM_LEADER";
  const isProductSpec = role === "PRODUCT_SPECIALIST";

  const canEditThisMember =
    canManageRoster && !isSelf && (!isMemberTL || isAdmin);

  return (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-gw-bg2 transition-colors">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-[12px] font-semibold flex-shrink-0 ${
          isMemberTL
            ? "bg-gw-fern-bg border border-gw-fern-dim text-gw-fern-text"
            : isMemberSubLead
              ? "bg-gw-amber-bg border border-gw-amber-dim text-gw-amber"
              : isProductSpec
                ? "bg-gw-cyan-bg border border-gw-cyan-dim text-gw-cyan"
                : "bg-gw-bg3 text-gw-sub"
        }`}
      >
        {member.name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-mono text-[13px] text-gw-text truncate">
            {member.name}
          </span>
          {isMemberTL && (
            <Badge variant="green" dot={false}>
              <Crown size={10} /> TL
            </Badge>
          )}
          {isMemberSubLead && (
            <Badge variant="amber" dot={false}>
              <Star size={10} /> Sub-Lead
            </Badge>
          )}
          {isProductSpec && (
            <Badge variant="cyan" dot={false}>
              <Sparkles size={10} /> Product
            </Badge>
          )}
          {role === "FRONTEND" && (
            <Badge variant="cyan" dot={false}>
              Frontend
            </Badge>
          )}
          {role === "BACKEND" && (
            <Badge variant="muted" dot={false}>
              Backend
            </Badge>
          )}
          {isSelf && (
            <span className="font-mono text-[10px] text-gw-muted">(you)</span>
          )}
        </div>
        <p className="font-mono text-[10px] text-gw-muted truncate">
          {member.email}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {canEditThisMember ? (
          <>
            <div className="w-40">
              <Select
                value={role}
                onChange={(e) => onChangeRole(e.target.value as GroupRole)}
                options={isAdmin ? GROUP_ROLE_OPTIONS : TL_ASSIGNABLE_OPTIONS}
              />
            </div>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Remove member"
              onClick={onRemove}
              className="text-gw-red hover:bg-gw-red-bg"
            >
              <X size={13} />
            </IconButton>
          </>
        ) : (
          <span className="font-mono text-[10px] text-gw-muted">
            {GROUP_ROLE_LABELS[role]}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Add Member Modal
// ─────────────────────────────────────────────

interface Candidate {
  id: string;
  name: string;
  email: string;
  systemRole: "ADMIN" | "USER";
}

function AddMemberModal({
  groupId,
  isAdmin,
  onClose,
  onAdded,
}: {
  groupId: string;
  isAdmin: boolean;
  onClose: () => void;
  onAdded: (member: GroupMember) => void;
}) {
  const toast = useToast();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [role, setRole] = useState<GroupRole>("MEMBER");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const url = new URL(
      `/api/groups/${groupId}/candidates`,
      window.location.origin
    );
    if (search.trim()) url.searchParams.set("q", search.trim());

    fetch(url.toString(), { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setCandidates(j?.data?.candidates ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load candidates");
          setCandidates([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [groupId, search, toast]);

  const handleAdd = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: selected, role }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.member) {
        throw new Error(json?.message || "Failed to add member");
      }
      toast.success("Member added");
      onAdded(json.data.member as GroupMember);
    } catch (err) {
      toast.error(
        "Add failed",
        err instanceof Error ? err.message : "Unknown"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-gw-bg1 border border-gw-border rounded-xl w-full max-w-md p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="font-mono text-[14px] text-gw-text">Add Member</h3>
          <p className="font-mono text-[11px] text-gw-muted mt-1">
            Search for a user and assign their group role
          </p>
        </div>

        <Input
          label="Search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelected(null);
          }}
          prefixNode={<Search size={13} className="text-gw-muted" />}
        />

        {loading ? (
          <p className="font-mono text-[12px] text-gw-muted py-6 text-center">
            Loading…
          </p>
        ) : candidates.length === 0 ? (
          <p className="font-mono text-[12px] text-gw-muted py-6 text-center">
            {search
              ? "No matches found."
              : "All users are already members of this group."}
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5">
            {candidates.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelected(u.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-[4px] border text-left transition-colors ${
                  selected === u.id
                    ? "bg-gw-fern-bg border-gw-fern-dim"
                    : "bg-gw-bg2 border-gw-border hover:border-gw-border-hi"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-gw-bg3 flex items-center justify-center font-mono text-[11px] text-gw-sub flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[12px] text-gw-text truncate">
                    {u.name}
                    {u.systemRole === "ADMIN" && (
                      <span className="ml-2 text-[10px] text-gw-fern-text">
                        (Admin)
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-[10px] text-gw-muted truncate">
                    {u.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <Select
          label="Group Role"
          value={role}
          onChange={(e) => setRole(e.target.value as GroupRole)}
          options={isAdmin ? GROUP_ROLE_OPTIONS : TL_ASSIGNABLE_OPTIONS}
          hint={
            isAdmin
              ? "You can assign any role including Team Leader"
              : "Only an admin can assign Team Leader"
          }
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-gw-border">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            loading={submitting}
            disabled={!selected}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Create Project Modal
// ─────────────────────────────────────────────

function CreateProjectModal({
  groupId,
  members,
  onClose,
  onCreated,
}: {
  groupId: string;
  members: GroupMember[];
  onClose: () => void;
  onCreated: (project: ProjectSummary) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
  const [leadId, setLeadId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/projects`, {
        method: "POST",
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
        throw new Error(json?.message || "Failed to create project");
      }
      toast.success("Project created", json.data.project.name);
      onCreated(json.data.project as ProjectSummary);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-gw-bg1 border border-gw-border rounded-xl w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="font-mono text-[14px] text-gw-text">
            Create Project
          </h3>
          <p className="font-mono text-[11px] text-gw-muted mt-1">
            Group work into a project with its own lead
          </p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Website Redesign"
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            options={PROJECT_STATUS_OPTIONS}
          />

          <Select
            label="Project Lead (optional)"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            options={[
              { value: "", label: "No lead yet" },
              ...members.map((m) => ({
                value: m.id,
                label: `${m.name} · ${m.email}`,
              })),
            ]}
            hint="Only group members can be project lead"
          />

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

          <div className="flex justify-end gap-2 pt-2 border-t border-gw-border">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}