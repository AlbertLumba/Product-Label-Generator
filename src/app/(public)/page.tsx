// src/app/(public)/page.tsx

import prisma from "@/lib/prisma";
import MapApp from "./MapApp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const terminals = await prisma.terminal.findMany({
    select: {
      id: true,
      name: true,
      area: true,
      latitude: true,
      longitude: true,
      variants: {
        select: { variantId: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const variants = await prisma.routeVariant.findMany({
    select: {
      id: true,
      name: true,
      direction: true,
      geometry: true,
      route: { select: { code: true, name: true } },
      stops: {
        orderBy: { sequence: "asc" },
        select: {
          sequence: true,
          isTerminal: true,
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
    },
  });

  return (
    <MapApp
      terminals={terminals.map((t) => ({
        id: t.id,
        name: t.name,
        area: t.area,
        latitude: t.latitude,
        longitude: t.longitude,
        variantIds: t.variants.map((v) => v.variantId),
      }))}
      variants={variants.map((v) => ({
        id: v.id,
        name: v.name,
        direction: v.direction,
        geometry: v.geometry as { type: string; coordinates: unknown } | null,
        routeCode: v.route.code,
        routeName: v.route.name,
        stops: v.stops.map((s) => ({
          sequence: s.sequence,
          isTerminal: s.isTerminal,
          ...s.stop,
        })),
      }))}
    />
  );
}