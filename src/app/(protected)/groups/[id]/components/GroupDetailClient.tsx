// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/groups/[id]/components/GroupDetailClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  ListChecks,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { useToast } from "@/components/ui/Toast";
import type { GroupDetail } from "../page";

const priorityVariant: Record<
  GroupDetail["tasks"][number]["priority"],
  "muted" | "cyan" | "amber" | "red"
> = {
  LOW: "muted",
  MEDIUM: "cyan",
  HIGH: "amber",
  URGENT: "red",
};

export function GroupDetailClient({
  group: initial,
  isAdmin,
}: {
  group: GroupDetail;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const toast = useToast();

  const [group, setGroup] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this group?`)) return;
    try {
      const res = await fetch(
        `/api/groups/${group.id}/members?userId=${userId}`,
        { method: "DELETE", credentials: "include" }
      );
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
    <div className="mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/groups")}
            className="w-8 h-8 rounded-lg border border-[var(--gw-border)] flex items-center justify-center text-[var(--gw-sub)] hover:text-[var(--gw-text)] hover:border-[var(--gw-border-hi)] transition-colors"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-[var(--gw-text)]">
              {group.name}
            </h2>
            {group.description && (
              <p className="text-sm text-[var(--gw-sub)]">
                {group.description}
              </p>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<UserPlus size={13} />}
              onClick={() => setAdding(true)}
            >
              Add Member
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              loading={deleting}
              onClick={handleDeleteGroup}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {adding && (
        <AddMemberModal
          groupId={group.id}
          existingMemberIds={group.members.map((m) => m.id)}
          onClose={() => setAdding(false)}
          onAdded={(member) => {
            setGroup((g) => ({ ...g, members: [...g.members, member] }));
            setAdding(false);
          }}
        />
      )}

      {/* Members */}
      <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[var(--gw-sub)]" />
          <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-[var(--gw-sub)]">
            Members ({group.members.length})
          </p>
        </div>

        {group.members.length === 0 ? (
          <p className="font-mono text-[12px] text-[var(--gw-muted)] py-2">
            No members yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {group.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-[4px] bg-[var(--gw-bg2)] border border-[var(--gw-border)]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[var(--gw-bg3)] flex items-center justify-center font-mono text-[11px] text-[var(--gw-sub)] flex-shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[12px] text-[var(--gw-text)] truncate">
                      {m.name}
                      {m.role === "ADMIN" && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-[var(--gw-fern-text)]">
                          <ShieldCheck size={10} /> Admin
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-[10px] text-[var(--gw-muted)] truncate">
                      {m.email}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="Remove member"
                    onClick={() => handleRemoveMember(m.id, m.name)}
                    className="text-[var(--gw-red)] hover:bg-[var(--gw-red-bg)]"
                  >
                    <X size={12} />
                  </IconButton>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tasks */}
      <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ListChecks size={14} className="text-[var(--gw-sub)]" />
          <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-[var(--gw-sub)]">
            Tasks ({group.tasks.length})
          </p>
        </div>

        {group.tasks.length === 0 ? (
          <p className="font-mono text-[12px] text-[var(--gw-muted)] py-2">
            No tasks in this group yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {group.tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => router.push(`/tasks/${t.id}`)}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-[4px] bg-[var(--gw-bg2)] border border-[var(--gw-border)] cursor-pointer hover:bg-[var(--gw-bg3)] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant={priorityVariant[t.priority]}>
                    {t.priority}
                  </Badge>
                  <span className="font-mono text-[12px] text-[var(--gw-text)] truncate">
                    {t.title}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[var(--gw-muted)] flex-shrink-0">
                  by {t.authorName}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Add member modal
// ─────────────────────────────────────────────

interface UserOption {
  id: string;
  name: string;
  email: string;
}

function AddMemberModal({
  groupId,
  existingMemberIds,
  onClose,
  onAdded,
}: {
  groupId: string;
  existingMemberIds: string[];
  onClose: () => void;
  onAdded: (member: GroupDetail["members"][number]) => void;
}) {
  const toast = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useState(() => {
    fetch("/api/users", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        const all: UserOption[] = j?.data?.users ?? [];
        setUsers(all.filter((u) => !existingMemberIds.includes(u.id)));
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  });

  const handleAdd = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: selected }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.member) {
        throw new Error(json?.message || "Failed to add member");
      }
      toast.success("Member added");
      onAdded(json.data.member);
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
        className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl w-full max-w-md p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="font-mono text-[14px] text-[var(--gw-text)]">
            Add Member
          </h3>
          <p className="font-mono text-[11px] text-[var(--gw-muted)] mt-1">
            Select a user to add to this group
          </p>
        </div>

        {loading ? (
          <p className="font-mono text-[12px] text-[var(--gw-muted)] py-4 text-center">
            Loading…
          </p>
        ) : users.length === 0 ? (
          <p className="font-mono text-[12px] text-[var(--gw-muted)] py-4 text-center">
            All users are already members.
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto flex flex-col gap-1.5">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelected(u.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-[4px] border text-left transition-colors ${
                  selected === u.id
                    ? "bg-[var(--gw-fern-bg)] border-[var(--gw-fern-dim)]"
                    : "bg-[var(--gw-bg2)] border-[var(--gw-border)] hover:border-[var(--gw-border-hi)]"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[var(--gw-bg3)] flex items-center justify-center font-mono text-[11px] text-[var(--gw-sub)] flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[12px] text-[var(--gw-text)] truncate">
                    {u.name}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--gw-muted)] truncate">
                    {u.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--gw-border)]">
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