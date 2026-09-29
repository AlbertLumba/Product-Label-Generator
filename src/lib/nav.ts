// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/nav.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { Role } from '@/lib/auth'

// Icon names as strings — safe to serialize over the wire.
export type NavIcon =
  | 'dashboard'
  | 'tasks'
  | 'groups'
  | 'users'
  | 'activity'
  | 'settings'

export interface NavItem {
  label: string
  path: string
  icon: NavIcon
  roles: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard', roles: ['ADMIN', 'USER'] },
  { label: 'Tasks',     path: '/tasks',     icon: 'tasks',     roles: ['ADMIN', 'USER'] },
  { label: 'Groups',    path: '/groups',    icon: 'groups',    roles: ['ADMIN', 'USER'] },
  { label: 'Users',     path: '/users',     icon: 'users',     roles: ['ADMIN'] },
  { label: 'Activity',  path: '/activity',  icon: 'activity',  roles: ['ADMIN'] },
  { label: 'Settings',  path: '/settings',  icon: 'settings',  roles: ['ADMIN', 'USER'] },
]

export function getNavForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}