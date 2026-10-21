// src/app/api/admin/terminals/bbox/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const minLng = parseFloat(searchParams.get("minLng") || "0");
  const minLat = parseFloat(searchParams.get("minLat") || "0");
  const maxLng = parseFloat(searchParams.get("maxLng") || "0");
  const maxLat = parseFloat(searchParams.get("maxLat") || "0");

  if (isNaN(minLng) || isNaN(minLat) || isNaN(maxLng) || isNaN(maxLat)) {
    return NextResponse.json({ error: "Invalid bounds" }, { status: 400 });
  }

  try {
    const terminals = await prisma.terminal.findMany({
      where: {
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLng, lte: maxLng },
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        variants: { select: { variantId: true } },
      },
    });

    return NextResponse.json({
      terminals: terminals.map((t) => ({
        id: t.id,
        name: t.name,
        latitude: t.latitude,
        longitude: t.longitude,
        variantIds: t.variants.map((v) => v.variantId),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch terminals" }, { status: 500 });
  }
}