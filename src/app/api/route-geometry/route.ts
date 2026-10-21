// src/app/api/route-geometry/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { variantId, coordinates } = (await req.json()) as {
    variantId?: string;
    coordinates: [number, number][];
  };

  if (!coordinates || coordinates.length < 2) {
    return NextResponse.json({ error: "Need at least 2 coordinates" }, { status: 400 });
  }

  const coordString = coordinates.map(([lng, lat]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return NextResponse.json({ error: "OSRM request failed" }, { status: 502 });

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route?.geometry) return NextResponse.json({ error: "No route found" }, { status: 404 });

    if (variantId) {
      try {
        await prisma.routeVariant.update({
          where: { id: variantId },
          data: { geometry: route.geometry },
        });
      } catch {}
    }

    return NextResponse.json({ geometry: route.geometry, distance: route.distance, duration: route.duration });
  } catch {
    return NextResponse.json({ error: "Routing failed" }, { status: 500 });
  }
}