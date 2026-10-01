// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/permissions/group.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import prisma from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";
import type { GroupRole } from "@prisma/client";

// ─────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────

export async function getMembership(userId: string, groupId: string) {
  return prisma.userGroup.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: { id: true, role: true },
  });
}

export function isAdmin(user: SessionUser) {
  return user.role === "ADMIN";
}

export async function isGroupMember(userId: string, groupId: string) {
  const m = await getMembership(userId, groupId);
  return m !== null;
}

export async function isTeamLeader(userId: string, groupId: string) {
  const m = await getMembership(userId, groupId);
  return m?.role === "TEAM_LEADER";
}

// ─────────────────────────────────────────────
// Group permissions
// ─────────────────────────────────────────────

/**
 * Can this user view the group (list roster, tasks)?
 * Admin OR any member.
 */
export async function canViewGroup(user: SessionUser, groupId: string) {
  if (isAdmin(user)) return true;
  return isGroupMember(user.id, groupId);
}

/**
 * Can this user edit group metadata (name, description)?
 * Admin OR Team Leader of that group.
 */
export async function canEditGroup(user: SessionUser, groupId: string) {
  if (isAdmin(user)) return true;
  return isTeamLeader(user.id, groupId);
}

/**
 * Can this user add/remove members and change roles?
 * Admin OR Team Leader of that group.
 */
export async function canManageRoster(user: SessionUser, groupId: string) {
  if (isAdmin(user)) return true;
  return isTeamLeader(user.id, groupId);
}

/**
 * Can this user assign a specific role?
 * - Admin: any role, any group
 * - Team Leader: any role except TEAM_LEADER (only admin promotes TL)
 */
export function canAssignRole(
  user: SessionUser,
  actorIsTL: boolean,
  targetRole: GroupRole,
) {
  if (isAdmin(user)) return true;
  if (!actorIsTL) return false;
  if (targetRole === "TEAM_LEADER") return false;
  return true;
}

/**
 * Can this user create tasks in the group?
 * Admin OR any member.
 */
export async function canCreateTaskInGroup(
  user: SessionUser,
  groupId: string,
) {
  if (isAdmin(user)) return true;
  return isGroupMember(user.id, groupId);
}

// ─────────────────────────────────────────────
// Project permissions
// ─────────────────────────────────────────────

/**
 * Can this user create a project inside this group?
 * Admin OR Team Leader of the group.
 */
export async function canCreateProject(user: SessionUser, groupId: string) {
  if (isAdmin(user)) return true;
  return isTeamLeader(user.id, groupId);
}

/**
 * Can this user edit/delete a project?
 * Admin OR TL of the parent group OR the project's lead.
 */
export async function canEditProject(
  user: SessionUser,
  groupId: string,
  projectLeadId: string | null,
) {
  if (isAdmin(user)) return true;
  if (projectLeadId === user.id) return true;
  return isTeamLeader(user.id, groupId);
}