// src/app/api/terminals/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const terminal = await prisma.terminal.findUnique({
    where: { id },
    include: {
      city: { select: { name: true, region: true } },
      variants: {
        include: {
          variant: {
            include: {
              route: {
                select: {
                  id: true,
                  code: true,
                  name: true,
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
                    take: 1,
                  },
                },
              },
              stops: {
                orderBy: { sequence: "asc" },
                take: 3,
                include: {
                  stop: { select: { name: true, landmark: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!terminal) {
    return NextResponse.json(
      { error: "Terminal not found" },
      { status: 404 },
    );
  }

  const routes = terminal.variants.map((rt) => ({
    variantId: rt.variant.id,
    variantName: rt.variant.name,
    direction: rt.variant.direction,
    route: {
      id: rt.variant.route.id,
      code: rt.variant.route.code,
      name: rt.variant.route.name,
    },
    fare: rt.variant.route.fares[0]
      ? {
          min: rt.variant.route.fares[0].amountMin,
          max: rt.variant.route.fares[0].amountMax,
          passengerType: rt.variant.route.fares[0].passengerType,
        }
      : null,
    previewStops: rt.variant.stops.map((s) => ({
      sequence: s.sequence,
      name: s.stop.name,
      landmark: s.stop.landmark,
    })),
  }));

  return NextResponse.json({
    data: {
      id: terminal.id,
      name: terminal.name,
      area: terminal.area,
      address: terminal.address,
      latitude: terminal.latitude,
      longitude: terminal.longitude,
      notes: terminal.notes,
      city: terminal.city,
      routes,
    },
  });
}