// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/users/components/UsersClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users as UsersIcon,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Pencil,
  Mail,
  ListChecks,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { IconButton } from "@/components/ui/IconButton";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";
import type { UserRow } from "../page";

interface Props {
  initial: UserRow[];
}

export function UsersClient({ initial }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [users, setUsers] = useState<UserRow[]>(initial);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);

  const debouncedQ = useDebounce(q, 300);
  const firstRender = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (debouncedQ) qs.set("q", debouncedQ);
      const res = await fetch(`/api/users?${qs.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json?.data) {
        throw new Error(json?.message || "Failed to load users");
      }
      setUsers(json.data.users);
    } catch (err) {
      toast.error(
        "Load failed",
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, toast]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    if (!roleFilter) return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to delete");
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted", name);
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
          <div className="w-10 h-10 bg-[var(--gw-fern-bg)] border border-[var(--gw-fern-dim)] rounded-xl flex items-center justify-center">
            <UsersIcon size={18} className="text-[var(--gw-fern-text)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--gw-text)]">Users</h2>
            <p className="text-sm text-[var(--gw-sub)]">
              {users.length} total ·{" "}
              {users.filter((u) => u.role === "ADMIN").length} admins
            </p>
          </div>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
          New User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Search"
          placeholder="Search name or email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          prefixNode={<Search size={13} className="text-[var(--gw-muted)]" />}
        />
        <Select
          label="Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={[
            { value: "", label: "All roles" },
            { value: "ADMIN", label: "Admins" },
            { value: "USER", label: "Users" },
          ]}
        />
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(user) => {
            setUsers((prev) => [user, ...prev]);
            setShowCreate(false);
          }}
        />
      )}

      {/* List */}
      <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl overflow-hidden">
        {loading && (
          <div className="px-5 py-3 border-b border-[var(--gw-border)] text-xs font-mono text-[var(--gw-muted)]">
            Loading…
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="px-5 py-16 text-center">
            <UsersIcon
              size={28}
              className="mx-auto text-[var(--gw-muted)] mb-3"
            />
            <p className="font-mono text-[13px] text-[var(--gw-sub)]">
              No users found
            </p>
          </div>
        )}

        <div className="divide-y divide-[var(--gw-border)]">
          {filtered.map((user) => (
            <UserRowItem
              key={user.id}
              user={user}
              onEdit={() => router.push(`/users/${user.id}`)}
              onDelete={() => handleDelete(user.id, user.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Row
// ─────────────────────────────────────────────

function UserRowItem({
  user,
  onEdit,
  onDelete,
}: {
  user: UserRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const initials = user.name.charAt(0).toUpperCase();
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--gw-bg2)] transition-colors">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-[12px] font-semibold flex-shrink-0 ${
          isAdmin
            ? "bg-[var(--gw-fern-bg)] border border-[var(--gw-fern-dim)] text-[var(--gw-fern-text)]"
            : "bg-[var(--gw-bg3)] text-[var(--gw-sub)]"
        }`}
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-mono text-[13px] text-[var(--gw-text)] truncate">
            {user.name}
          </span>
          {isAdmin && (
            <Badge variant="green" dot={false}>
              <ShieldCheck size={10} /> Admin
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--gw-muted)]">
          <span className="inline-flex items-center gap-1">
            <Mail size={10} /> {user.email}
          </span>
          <span className="inline-flex items-center gap-1">
            <ListChecks size={10} /> {user.taskCount} tasks
          </span>
          <span className="inline-flex items-center gap-1">
            <FolderKanban size={10} /> {user.groupCount} groups
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Edit user"
          onClick={onEdit}
        >
          <Pencil size={13} />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Delete user"
          onClick={onDelete}
          className="text-[var(--gw-red)] hover:bg-[var(--gw-red-bg)]"
        >
          <Trash2 size={13} />
        </IconButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Create modal
// ─────────────────────────────────────────────

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (user: UserRow) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.user) {
        throw new Error(json?.message || "Failed to create user");
      }
      toast.success("User created", json.data.user.name);
      onCreated({
        ...json.data.user,
        taskCount: 0,
        groupCount: 0,
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
            Create User
          </h3>
          <p className="font-mono text-[11px] text-[var(--gw-muted)] mt-1">
            Add a new member to the team
          </p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Doe"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="jane@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="min 6 characters"
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "USER")}
            options={[
              { value: "USER", label: "User" },
              { value: "ADMIN", label: "Admin" },
            ]}
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

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}