// src/app/api/admin/save/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // 1. If saving a route path (geometry)
    if (geometry) {
      const existingVariant = await prisma.routeVariant.findUnique({ where: { id } });
      
      if (!existingVariant) {
        return NextResponse.json({ error: "Route variant not found" }, { status: 404 });
      }

      await prisma.routeVariant.update({ 
        where: { id }, 
        data: { geometry } 
      });
      return NextResponse.json({ success: true });
    }

    // 2. If updating a terminal, do NOT clear geometry here.
    // The frontend will send the new geometry after it fetches it from OSRM.
    if (id) {
      await prisma.terminal.update({ 
        where: { id }, 
        data: { 
          ...(name !== undefined && { name }),
          ...(lat !== undefined && { latitude: lat }),
          ...(lng !== undefined && { longitude: lng }),
        } 
      });

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