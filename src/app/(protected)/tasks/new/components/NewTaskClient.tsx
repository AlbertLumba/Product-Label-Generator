// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/tasks/new/components/NewTaskClient.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";

interface GroupOption {
  id: string;
  name: string;
}

interface MemberOption {
  id: string;
  name: string;
  email: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

export function NewTaskClient({ groups }: { groups: GroupOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const presetProjectId = searchParams.get("projectId") ?? "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [groupId, setGroupId] = useState("");
  const [projectId, setProjectId] = useState(presetProjectId);
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // If we arrived with a projectId in the query, look up its group first
  useEffect(() => {
    if (!presetProjectId) return;
    fetch(`/api/projects/${presetProjectId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        const gid = j?.data?.project?.group?.id;
        if (gid) {
          setGroupId(gid);
          setProjectId(presetProjectId);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load projects + members when group changes
  useEffect(() => {
    setAssigneeId("");
    if (!groupId) {
      setProjects([]);
      setMembers([]);
      setProjectId("");
      return;
    }

    let cancelled = false;
    setLoadingProjects(true);
    setLoadingMembers(true);

    Promise.all([
      fetch(`/api/groups/${groupId}/projects`, {
        credentials: "include",
      }).then((r) => r.json()),
      fetch(`/api/groups/${groupId}`, { credentials: "include" }).then((r) =>
        r.json()
      ),
    ])
      .then(([projectsRes, groupRes]) => {
        if (cancelled) return;
        setProjects(projectsRes?.data?.projects ?? []);
        const m: MemberOption[] = (groupRes?.data?.group?.members ?? []).map(
          (x: { id: string; name: string; email: string }) => ({
            id: x.id,
            name: x.name,
            email: x.email,
          })
        );
        setMembers(m);
      })
      .catch(() => {
        if (!cancelled) {
          setProjects([]);
          setMembers([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingProjects(false);
          setLoadingMembers(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          groupId: groupId || null,
          projectId: projectId || null,
          assigneeId: assigneeId || null,
          dueDate: dueDate || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.task) {
        throw new Error(json?.message || "Failed to create task");
      }
      toast.success("Task created", json.data.task.title);
      router.push(`/tasks/${json.data.task.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error("Create failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg border border-gw-border flex items-center justify-center text-gw-sub hover:text-gw-text hover:border-gw-border-hi transition-colors"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gw-text">New Task</h2>
          <p className="text-sm text-gw-sub">Describe what you worked on</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gw-bg1 border border-gw-border rounded-xl p-5 flex flex-col gap-4"
      >
        {error && (
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        )}

        <Input
          label="Title"
          placeholder="e.g. Update tracking spreadsheet"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />

        <Textarea
          label="Description"
          placeholder="Add details about this task…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={5000}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
              { value: "URGENT", label: "Urgent" },
            ]}
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {groups.length > 0 && (
          <Select
            label="Group (optional)"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            options={[
              { value: "", label: "No group" },
              ...groups.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />
        )}

        {groupId && (
          <Select
            label="Project (optional)"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={loadingProjects}
            options={[
              {
                value: "",
                label: loadingProjects
                  ? "Loading projects…"
                  : "No project",
              },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        )}

        {groupId && (
          <Select
            label="Assignee (optional)"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            disabled={loadingMembers}
            options={[
              {
                value: "",
                label: loadingMembers
                  ? "Loading members…"
                  : "Unassigned",
              },
              ...members.map((m) => ({
                value: m.id,
                label: `${m.name} · ${m.email}`,
              })),
            ]}
            hint="Only members of the selected group can be assigned"
          />
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gw-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            icon={<Plus size={14} />}
            loading={submitting}
          >
            Create Task
          </Button>
        </div>
      </form>
    </div>
  );
}