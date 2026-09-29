// src/app/(protected)/tasks/new/components/NewTaskClient.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";

interface GroupOption {
  id: string;
  name: string;
}

export function NewTaskClient({ groups }: { groups: GroupOption[] }) {
  const router = useRouter();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [groupId, setGroupId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg border border-[var(--gw-border)] flex items-center justify-center text-[var(--gw-sub)] hover:text-[var(--gw-text)] hover:border-[var(--gw-border-hi)] transition-colors"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-[var(--gw-text)]">
            New Task
          </h2>
          <p className="text-sm text-[var(--gw-sub)]">
            Describe what you worked on
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl p-5 flex flex-col gap-4"
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

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--gw-border)]">
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