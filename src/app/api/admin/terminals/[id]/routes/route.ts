// src/app/api/admin/terminals/[id]/routes/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const terminal = await prisma.terminal.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            variant: {
              include: {
                route: { select: { code: true, name: true } },
                stops: {
                  orderBy: { sequence: "asc" },
                  include: {
                    stop: { select: { id: true, name: true, landmark: true, latitude: true, longitude: true } },
                  },
                },
                terminals: { select: { terminalId: true } },
              },
            },
          },
        },
      },
    });

    if (!terminal) {
      return NextResponse.json({ error: "Terminal not found" }, { status: 404 });
    }

    const variants = terminal.variants.map((rt) => ({
      id: rt.variant.id,
      name: rt.variant.name,
      direction: rt.variant.direction,
      geometry: rt.variant.geometry,
      routeCode: rt.variant.route.code,
      routeName: rt.variant.route.name,
      terminalIds: rt.variant.terminals.map((t) => t.terminalId),
      stops: rt.variant.stops.map((s) => ({
        sequence: s.sequence,
        isTerminal: s.isTerminal,
        ...s.stop,
      })),
    }));

    return NextResponse.json({ variants });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}