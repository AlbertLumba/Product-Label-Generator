// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/validations/project.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from "zod";

export const ProjectStatusEnum = z.enum([
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
]);

const dateInput = z
  .string()
  .optional()
  .nullable()
  .transform((v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  });

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  description: z.string().max(2000).optional().nullable(),
  status: ProjectStatusEnum.default("ACTIVE"),
  leadId: z.string().optional().nullable(),
  startDate: dateInput,
  dueDate: dateInput,
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: ProjectStatusEnum.optional(),
  leadId: z.string().optional().nullable(),
  startDate: dateInput,
  dueDate: dateInput,
});