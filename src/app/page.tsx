// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export default async function RootPage() {
  const user = await getUser();
  if (user) redirect("/dashboard");
  redirect("/login");
}