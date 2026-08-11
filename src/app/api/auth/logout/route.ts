// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/auth/logout/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api/handler";
import { sessionCookieName } from "@/lib/auth";

export const POST = apiHandler(async () => {
  const response = NextResponse.json(
    {
      success: true,
      code: 200,
      message: "Logged out",
      data: null,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );

  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
});