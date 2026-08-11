// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/api/server-fetch.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Server components can't fetch a relative path — Next.js requires
// an absolute URL for server-side fetches. This builds one from the
// incoming request's headers and forwards the session cookie so the
// auth check in the API route (getUser()) still works.

import { cookies, headers } from "next/headers";

export async function serverFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${protocol}://${host}`;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
      ...init.headers,
    },
    cache: "no-store",
  });

  return res.json();
}