// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/users/[id]/components/UserDetailClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  ShieldCheck,
  FolderKanban,
  Mail,
  Calendar,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Divider } from "@/components/ui/Divider";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";
import type { UserDetail } from "../page";

const formatDate = (v: string) =>
  new Date(v).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function UserDetailClient({ user: initial }: { user: UserDetail }) {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [role, setRole] = useState<"ADMIN" | "USER">(initial.role);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    name !== initial.name ||
    email !== initial.email ||
    role !== initial.role ||
    password.length > 0;

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (name !== initial.name) body.name = name;
      if (email !== initial.email) body.email = email;
      if (role !== initial.role) body.role = role;
      if (password) body.password = password;

      const res = await fetch(`/api/users/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.user) {
        throw new Error(json?.message || "Failed to save");
      }
      toast.success("Saved");
      setPassword("");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error("Save failed", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete user "${initial.name}"? This cannot be undone.`))
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${initial.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to delete");
      toast.success("User deleted");
      router.push("/users");
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
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/users")}
            className="w-8 h-8 rounded-lg border border-[var(--gw-border)] flex items-center justify-center text-[var(--gw-sub)] hover:text-[var(--gw-text)] hover:border-[var(--gw-border-hi)] transition-colors"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-[var(--gw-text)]">
              {initial.name}
            </h2>
            <p className="text-sm text-[var(--gw-sub)]">Edit user</p>
          </div>
        </div>
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

      {error && <Alert variant="error">{error}</Alert>}

      <Card className="p-5 flex flex-col gap-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current"
          hint="Min 6 characters"
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

        <div className="flex justify-end pt-2 border-t border-[var(--gw-border)]">
          <Button
            icon={<Save size={13} />}
            loading={saving}
            disabled={!dirty}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-3">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--gw-sub)]">
          Profile
        </p>
        <div className="grid grid-cols-2 gap-4">
          <MetaItem
            icon={<ShieldCheck size={13} />}
            label="Role"
            value={initial.role}
          />
          <MetaItem
            icon={<Calendar size={13} />}
            label="Joined"
            value={formatDate(initial.createdAt)}
          />
          <MetaItem
            icon={<ListChecks size={13} />}
            label="Tasks"
            value={String(initial.taskCount)}
          />
          <MetaItem
            icon={<Mail size={13} />}
            label="Email"
            value={initial.email}
          />
        </div>

        {initial.groups.length > 0 && (
          <>
            <Divider />
            <div>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--gw-muted)] mb-2">
                Groups
              </p>
              <div className="flex flex-wrap gap-2">
                {initial.groups.map((g) => (
                  <span
                    key={g.id}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-[3px] border bg-[var(--gw-bg3)] text-[var(--gw-sub)] border-[var(--gw-border)]"
                  >
                    <FolderKanban size={11} /> {g.name}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
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
      <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--gw-muted)]">
        {icon} {label}
      </span>
      <span className="font-mono text-[13px] text-[var(--gw-text)] truncate">
        {value}
      </span>
    </div>
  );
}