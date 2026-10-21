// src/app/api/admin/terminals/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const whereClause = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [terminals, total] = await Promise.all([
      prisma.terminal.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        orderBy: { name: "asc" },
        include: {
          variants: { select: { variantId: true } },
        },
      }),
      prisma.terminal.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: terminals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch terminals" }, { status: 500 });
  }
}