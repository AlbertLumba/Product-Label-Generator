// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/validations/group.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from "zod";

export const GroupRoleEnum = z.enum([
  "TEAM_LEADER",
  "SUB_TEAM_LEADER",
  "FRONTEND",
  "BACKEND",
  "PRODUCT_SPECIALIST",
  "MEMBER",
]);

export const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  leaderId: z.string().optional().nullable(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  leaderId: z.string().optional().nullable(),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: GroupRoleEnum.default("MEMBER"),
});

export const updateMemberRoleSchema = z.object({
  role: GroupRoleEnum,
});