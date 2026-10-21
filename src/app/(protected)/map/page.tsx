// src/app/(protected)/map/page.tsx

import prisma from "@/lib/prisma";
import AdminMap from "./AdminMap";

export const dynamic = "force-dynamic";

export default async function ProtectedMapPage() {
  const terminals = await prisma.terminal.findMany({
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      variants: { select: { variantId: true } },
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
      terminals: { select: { terminalId: true } },
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
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
      <AdminMap
        initialTerminals={terminals.map((t) => ({
          id: t.id,
          name: t.name,
          latitude: t.latitude,
          longitude: t.longitude,
          variantIds: t.variants.map((v) => v.variantId),
        }))}
        initialVariants={variants.map((v) => ({
          id: v.id,
          name: v.name,
          direction: v.direction,
          geometry: v.geometry,
          routeCode: v.route.code,
          routeName: v.route.name,
          terminalIds: v.terminals.map((t) => t.terminalId),
          stops: v.stops.map((s) => ({
            sequence: s.sequence,
            isTerminal: s.isTerminal,
            ...s.stop,
          })),
        }))}
      />
    </div>
  );
}