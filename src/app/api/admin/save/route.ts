// src/app/api/admin/save/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper to fetch route from OSRM
async function getOSRMRoute(startLng: number, startLat: number, endLng: number, endLat: number) {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.routes?.[0]?.geometry || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const city = await prisma.city.findFirst();
    if (!city) throw new Error("No city found");

    if (body.action === "createTerminal") {
      const terminal = await prisma.terminal.create({
        data: { name: body.name, latitude: body.lat, longitude: body.lng, cityId: city.id },
      });
      return NextResponse.json({ success: true, id: terminal.id });
    }

    if (body.action === "createRoute") {
      const route = await prisma.route.create({
        data: { code: body.code, name: body.name, cityId: city.id },
      });
      const variant = await prisma.routeVariant.create({
        data: { 
          routeId: route.id, 
          name: "Main Route", 
          direction: "OUTBOUND", 
          isDefault: true,
          geometry: body.geometry || null
        },
      });
      await prisma.routeTerminal.create({ data: { variantId: variant.id, terminalId: body.startId } });
      await prisma.routeTerminal.create({ data: { variantId: variant.id, terminalId: body.endId } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, lat, lng, geometry } = body;

    // 1. If saving a route path (from dragging the line)
    if (geometry) {
      await prisma.routeVariant.update({ where: { id }, data: { geometry } });
      return NextResponse.json({ success: true });
    }

    // 2. If updating a terminal
    if (id) {
      // First, update the terminal coordinates
      await prisma.terminal.update({ 
        where: { id }, 
        data: { 
          ...(name !== undefined && { name }),
          ...(lat !== undefined && { latitude: lat }),
          ...(lng !== undefined && { longitude: lng }),
        } 
      });

      // If the position moved, update the connected routes automatically
      if (lat !== undefined && lng !== undefined) {
        const connectedRoutes = await prisma.routeTerminal.findMany({
          where: { terminalId: id },
          include: { variant: true }
        });

        for (const rt of connectedRoutes) {
          // Find the other terminal this route connects to
          const allRouteTerminals = await prisma.routeTerminal.findMany({
            where: { variantId: rt.variantId }
          });
          const otherTerminalId = allRouteTerminals.find(t => t.terminalId !== id)?.terminalId;
          
          if (!otherTerminalId) continue;

          const startT = await prisma.terminal.findUnique({ where: { id } });
          const endT = await prisma.terminal.findUnique({ where: { id: otherTerminalId } });

          if (startT && endT) {
            // Fetch the exact road path from OSRM
            const newGeometry = await getOSRMRoute(startT.longitude, startT.latitude, endT.longitude, endT.latitude);
            
            // Save the new geometry
            if (newGeometry) {
              await prisma.routeVariant.update({
                where: { id: rt.variantId },
                data: { geometry: newGeometry }
              });
            }
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    const routeConnections = await prisma.routeTerminal.findMany({
      where: { terminalId: id }
    });
    
    if (routeConnections.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete terminal. It is connected to existing routes." },
        { status: 400 }
      );
    }

    await prisma.terminal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}