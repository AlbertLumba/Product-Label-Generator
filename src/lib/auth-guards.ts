// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/auth-guards.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { redirect } from "next/navigation";
import { getUser } from "./auth";
import type { SessionUser } from "./auth";

export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}