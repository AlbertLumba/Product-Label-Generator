// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/settings/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { requireUser } from "@/lib/auth-guards";
import { SettingsClient } from "./components/SettingsClient";

export default async function SettingsPage() {
  const user = await requireUser();
  return <SettingsClient user={user} />;
}