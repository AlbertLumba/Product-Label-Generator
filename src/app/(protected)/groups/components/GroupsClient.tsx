// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/groups/components/GroupsClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Plus,
  Users,
  ListChecks,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { IconButton } from "@/components/ui/IconButton";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";
import type { GroupRow } from "../page";

interface Props {
  initial: GroupRow[];
  isAdmin: boolean;
}

export function GroupsClient({ initial, isAdmin }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [groups, setGroups] = useState<GroupRow[]>(initial);
  const [showCreate, setShowCreate] = useState(false);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete group "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/groups/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to delete");
      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success("Group deleted", name);
    } catch (err) {
      toast.error(
        "Delete failed",
        err instanceof Error ? err.message : "Unknown"
      );
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
            <FolderKanban
              size={18}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--gw-text)]">
              Groups
            </h2>
            <p className="text-sm text-[var(--gw-sub)]">
              {groups.length} group{groups.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            New Group
          </Button>
        )}
      </div>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={(group) => {
            setGroups((prev) => [group, ...prev]);
            setShowCreate(false);
          }}
        />
      )}

      {/* Grid */}
      {groups.length === 0 ? (
        <Card className="p-16 text-center">
          <FolderKanban
            size={28}
            className="mx-auto text-[var(--gw-muted)] mb-3"
          />
          <p className="font-mono text-[13px] text-[var(--gw-sub)]">
            No groups yet
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              isAdmin={isAdmin}
              onClick={() => router.push(`/groups/${g.id}`)}
              onDelete={() => handleDelete(g.id, g.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupCard({
  group,
  isAdmin,
  onClick,
  onDelete,
}: {
  group: GroupRow;
  isAdmin: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4 cursor-pointer hover:border-[var(--gw-border-hi)] transition-colors flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--gw-bg3)] flex items-center justify-center flex-shrink-0">
            <FolderKanban size={15} className="text-[var(--gw-sub)]" />
          </div>
          <p className="font-mono text-[13px] text-[var(--gw-text)] truncate">
            {group.name}
          </p>
        </div>
        {isAdmin && (
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Delete group"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-[var(--gw-red)] hover:bg-[var(--gw-red-bg)]"
          >
            <Trash2 size={13} />
          </IconButton>
        )}
      </div>

      {group.description && (
        <p className="font-mono text-[11px] text-[var(--gw-muted)] line-clamp-2">
          {group.description}
        </p>
      )}

      <div className="flex items-center gap-4 font-mono text-[11px] text-[var(--gw-muted)] mt-auto">
        <span className="inline-flex items-center gap-1">
          <Users size={11} /> {group.memberCount} members
        </span>
        <span className="inline-flex items-center gap-1">
          <ListChecks size={11} /> {group.taskCount} tasks
        </span>
      </div>
    </div>
  );
}

function CreateGroupModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (group: GroupRow) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.group) {
        throw new Error(json?.message || "Failed to create group");
      }
      toast.success("Group created", json.data.group.name);
      onCreated({
        ...json.data.group,
        memberCount: 0,
        taskCount: 0,
      });
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
        className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl w-full max-w-md p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="font-mono text-[14px] text-[var(--gw-text)]">
            Create Group
          </h3>
          <p className="font-mono text-[11px] text-[var(--gw-muted)] mt-1">
            Organize users into teams
          </p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Design Team"
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--gw-border)]">
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