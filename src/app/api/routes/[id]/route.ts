// src/app/api/routes/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const variant = await prisma.routeVariant.findUnique({
    where: { id },
    include: {
      route: {
        include: {
          city: { select: { name: true, region: true } },
          fares: {
            where: {
              verifiedAt: { not: null },
              effectiveFrom: { lte: new Date() },
              OR: [
                { effectiveTo: null },
                { effectiveTo: { gt: new Date() } },
              ],
            },
            orderBy: { effectiveFrom: "desc" },
          },
        },
      },
      stops: {
        orderBy: { sequence: "asc" },
        include: {
          stop: {
            select: {
              id: true,
              name: true,
              landmark: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
      terminals: {
        include: {
          terminal: {
            select: {
              id: true,
              name: true,
              area: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
    },
  });

  if (!variant) {
    return NextResponse.json(
      { error: "Route variant not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    data: {
      variantId: variant.id,
      variantName: variant.name,
      direction: variant.direction,
      geometry: variant.geometry,
      route: {
        id: variant.route.id,
        code: variant.route.code,
        name: variant.route.name,
        description: variant.route.description,
        city: variant.route.city,
      },
      fares: variant.route.fares.map((f) => ({
        passengerType: f.passengerType,
        min: f.amountMin,
        max: f.amountMax,
        source: f.source,
        verifiedAt: f.verifiedAt,
      })),
      stops: variant.stops.map((s) => ({
        sequence: s.sequence,
        isTerminal: s.isTerminal,
        stop: s.stop,
      })),
      terminals: variant.terminals.map((t) => t.terminal),
    },
  });
}