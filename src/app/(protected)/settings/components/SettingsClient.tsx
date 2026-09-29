// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/settings/components/SettingsClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Save,
  ShieldCheck,
  User as UserIcon,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Divider } from "@/components/ui/Divider";
import { useToast } from "@/components/ui/Toast";
import type { SessionUser } from "@/lib/auth";

const formatDate = (v: string | Date) =>
  new Date(v).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function SettingsClient({ user }: { user: SessionUser }) {
  const toast = useToast();

  const [name, setName] = useState(user.name);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const profileDirty = name !== user.name;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setSavingProfile(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to save");
      toast.success("Profile updated");
      window.location.reload();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setProfileError(msg);
      toast.error("Save failed", msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to change password");
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setPasswordError(msg);
      toast.error("Change failed", msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
          <SettingsIcon
            size={18}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--gw-text)]">
            Settings
          </h2>
          <p className="text-sm text-[var(--gw-sub)]">
            Manage your account
          </p>
        </div>
      </div>

      {/* Account summary */}
      <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <UserIcon size={14} className="text-[var(--gw-sub)]" />
          <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-[var(--gw-sub)]">
            Account
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-mono text-[16px] font-semibold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[14px] text-[var(--gw-text)]">
              {user.name}
            </p>
            <p className="font-mono text-[11px] text-[var(--gw-muted)]">
              {user.email}
            </p>
            {isAdmin && (
              <span className="mt-1 inline-flex">
                <Badge variant="green" dot={false}>
                  <ShieldCheck size={10} /> Admin
                </Badge>
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Profile */}
      <Card className="p-5 flex flex-col gap-4">
        <div>
          <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-[var(--gw-sub)]">
            Profile
          </p>
          <p className="font-mono text-[11px] text-[var(--gw-muted)] mt-1">
            Update your display name
          </p>
        </div>

        {profileError && <Alert variant="error">{profileError}</Alert>}

        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            value={user.email ?? ""}
            disabled
            hint="Email cannot be changed"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              icon={<Save size={13} />}
              loading={savingProfile}
              disabled={!profileDirty}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Password */}
      <Card className="p-5 flex flex-col gap-4">
        <div>
          <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-[var(--gw-sub)]">
            Password
          </p>
          <p className="font-mono text-[11px] text-[var(--gw-muted)] mt-1">
            Change your password
          </p>
        </div>

        {passwordError && <Alert variant="error">{passwordError}</Alert>}

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Divider />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            hint="Minimum 6 characters"
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              icon={<KeyRound size={13} />}
              loading={savingPassword}
              disabled={
                !currentPassword || !newPassword || !confirmPassword
              }
            >
              Change Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}