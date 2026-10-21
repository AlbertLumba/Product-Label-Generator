// src/app/api/terminals/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const terminals = await prisma.terminal.findMany({
    select: {
      id: true,
      name: true,
      area: true,
      address: true,
      latitude: true,
      longitude: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: terminals });
}