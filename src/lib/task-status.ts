// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/task-status.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { TaskStatus } from "@/components/ui/MethodBadge";

interface TaskStatusInput {
  dueDate: string | Date | null;
  completedAt: string | Date | null;
  isReviewed: boolean;
}

export function deriveTaskStatus(task: TaskStatusInput): TaskStatus {
  if (task.isReviewed) return "APPROVED";
  if (task.completedAt) return "SUBMITTED";
  if (task.dueDate && new Date(task.dueDate) < new Date()) return "OVERDUE";
  return "DRAFT";
}