// src/app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    console.log("Login attempt for:", email); // Debug log

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 }
      );
    }

    // Find admin in the database
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log("Admin not found for email:", email);
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify the password
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    
    if (!isValid) {
      console.log("Password mismatch for:", email);
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    console.log("Login successful for:", email);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      },
    });
  } catch (error) {
    // This will print the EXACT error to your terminal
    console.error("LOGIN API CRASH:", error); 
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}