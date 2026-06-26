// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/auth/login/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler, getBody } from "@/lib/api/handler";
import { validate } from "@/lib/api/validate";
import { ok, unauthorized, forbidden } from "@/lib/api/server";
import { verifyPassword, createSession } from "@/lib/auth";
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

  if (user.accountStatus !== "ACTIVE") {
    return forbidden("Account is not active");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return unauthorized("Invalid email or password");
  }

  const session = await createSession(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: req.headers.get("x-forwarded-for") || "unknown",
    },
  });

  // Create response with session cookie
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
          companyName: user.companyName,
          companyLogo: user.companyLogo,
          role: user.role,
        },
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );

  // Set session cookie
  response.cookies.set("session_token", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  return response;
});