// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/auth/login/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler, getBody } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { unauthorized } from "@/lib/api/server";
import { verifyPassword, createSession, sessionCookieName, sessionMaxAgeSeconds } from "@/lib/auth";
import prisma from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
});

export const POST = apiHandler(async (req) => {
  const body = await getBody(req);

  const result = validate(loginSchema, body);
  if (!result.success) return result.response;

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return unauthorized("Invalid email or password");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return unauthorized("Invalid email or password");
  }

  const token = createSession(user.id);

  const response = NextResponse.json(
    {
      success: true,
      code: 200,
      message: "Success",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );

  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: sessionMaxAgeSeconds,
    path: "/",
  });

  return response;
});