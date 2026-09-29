// src/lib/validations/task.ts

import { z } from "zod";

export const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

const dateInput = z
  .string()
  .optional()
  .nullable()
  .transform((v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  });

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  priority: PriorityEnum.default("MEDIUM"),
  groupId: z.string().optional().nullable(),
  dueDate: dateInput,
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  priority: PriorityEnum.optional(),
  groupId: z.string().optional().nullable(),
  dueDate: dateInput,
  completedAt: z.string().optional().nullable(),
});

export const reviewTaskSchema = z.object({
  reviewNotes: z.string().max(5000).optional().nullable(),
  reviewed: z.boolean().default(true),
});

export const createCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(5000),
});

export const listTasksQuerySchema = z.object({
  scope: z.enum(["mine", "all"]).default("mine"),
  groupId: z.string().optional(),
  authorId: z.string().optional(),
  priority: PriorityEnum.optional(),
  reviewed: z.enum(["true", "false"]).optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});