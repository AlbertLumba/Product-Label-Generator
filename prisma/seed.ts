// prisma/seed.ts

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Cleaning existing data...");
  await prisma.routeStop.deleteMany();
  await prisma.routeTerminal.deleteMany();
  await prisma.fare.deleteMany();
  await prisma.routeVariant.deleteMany();
  await prisma.route.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.terminal.deleteMany();
  await prisma.city.deleteMany();
  await prisma.admin.deleteMany();
  console.log("✅ All existing data removed");

  // ─── Admin ───
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.create({
    data: {
      email: "admin@example.com",
      passwordHash: passwordHash,
      name: "Admin",
    },
  });
  console.log("👤 Admin created:", admin.email, "(Password: admin123)");

  // ─── Cities ───
  const sanPablo = await prisma.city.create({
    data: { name: "San Pablo", region: "Laguna" },
  });
  const nagcarlan = await prisma.city.create({
    data: { name: "Nagcarlan", region: "Laguna" },
  });
  const liliw = await prisma.city.create({
    data: { name: "Liliw", region: "Laguna" },
  });
  console.log("🏙️  3 cities created");

  // ─── Terminals ───
  const terminalsData = [
    {
      cityId: sanPablo.id,
      name: "San Pablo Central Terminal",
      area: "Poblacion",
      latitude: 14.06726,
      longitude: 121.3007,
    },
    {
      cityId: sanPablo.id,
      name: "San Pablo Cathedral Jeep Terminal",
      area: "Poblacion",
      latitude: 14.0680,
      longitude: 121.3250,
    },
    {
      cityId: sanPablo.id,
      name: "SM San Pablo Terminal",
      area: "Poblacion",
      latitude: 14.0715,
      longitude: 121.3150,
    },
    {
      cityId: sanPablo.id,
      name: "San Pablo Bayan Terminal",
      area: "Poblacion",
      latitude: 14.0650,
      longitude: 121.3200,
    },
    {
      cityId: nagcarlan.id,
      name: "Nagcarlan Terminal",
      area: "Poblacion",
      latitude: 14.1330,
      longitude: 121.4160,
    },
    {
      cityId: liliw.id,
      name: "Liliw Terminal",
      area: "Poblacion",
      latitude: 14.13315,
      longitude: 121.43126,
    },
  ];

  const terminals: Record<string, any> = {};
  for (const data of terminalsData) {
    const t = await prisma.terminal.create({ data });
    terminals[t.name] = t;
  }
  console.log(`🏢 ${terminalsData.length} terminals created`);

  // ─── Stops ───
  const stopsData = [
    {
      cityId: sanPablo.id,
      name: "San Pablo Cathedral",
      landmark: "Cathedral / fire station",
      latitude: 14.0680,
      longitude: 121.3250,
    },
    {
      cityId: sanPablo.id,
      name: "San Pablo Central",
      landmark: "City Central Terminal",
      latitude: 14.06726,
      longitude: 121.3007,
    },
    {
      cityId: sanPablo.id,
      name: "Real St",
      landmark: "Calamba Public Market",
      latitude: 14.0650,
      longitude: 121.3150,
    },
    {
      cityId: sanPablo.id,
      name: "Maharlika Highway (Calamba Rd)",
      landmark: "Maharlika Hwy",
      latitude: 14.0750,
      longitude: 121.3100,
    },
    {
      cityId: nagcarlan.id,
      name: "Nagcarlan Town Proper",
      landmark: "Municipal Hall / church",
      latitude: 14.1330,
      longitude: 121.4160,
    },
    {
      cityId: nagcarlan.id,
      name: "Nagcarlan Public Market",
      landmark: "Market",
      latitude: 14.1300,
      longitude: 121.4100,
    },
    {
      cityId: liliw.id,
      name: "Liliw Town Proper",
      landmark: "Batis ng Liliw / town center",
      latitude: 14.13315,
      longitude: 121.43126,
    },
    {
      cityId: liliw.id,
      name: "Liliw Church",
      landmark: "San Juan Bautista Church",
      latitude: 14.1300,
      longitude: 121.4300,
    },
  ];

  const stops: Record<string, any> = {};
  for (const data of stopsData) {
    const s = await prisma.stop.create({ data });
    stops[s.name] = s;
  }
  console.log(`📍 ${stopsData.length} stops created`);

  // ─── Routes & Variants ───
  const routesData = [
    {
      code: "SP-NAG",
      name: "San Pablo – Nagcarlan",
      start: "San Pablo Cathedral Jeep Terminal",
      end: "Nagcarlan Terminal",
      stops: ["San Pablo Cathedral", "Nagcarlan Town Proper"],
    },
    {
      code: "SP-LIL",
      name: "San Pablo – Liliw",
      start: "San Pablo Cathedral Jeep Terminal",
      end: "Liliw Terminal",
      stops: ["San Pablo Cathedral", "Liliw Town Proper"],
    },
    {
      code: "NAG-LIL",
      name: "Nagcarlan – Liliw",
      start: "Nagcarlan Terminal",
      end: "Liliw Terminal",
      stops: ["Nagcarlan Town Proper", "Liliw Town Proper"],
    },
    {
      code: "SP-CEN-NAG",
      name: "San Pablo Central – Nagcarlan",
      start: "San Pablo Central Terminal",
      end: "Nagcarlan Terminal",
      stops: ["San Pablo Central", "Maharlika Highway (Calamba Rd)", "Nagcarlan Public Market"],
    },
    {
      code: "SP-SM-LIL",
      name: "SM San Pablo – Liliw",
      start: "SM San Pablo Terminal",
      end: "Liliw Terminal",
      stops: ["Real St", "Liliw Church"],
    },
  ];

  for (const r of routesData) {
    const route = await prisma.route.create({
      data: { code: r.code, name: r.name, cityId: sanPablo.id },
    });

    const startT = terminals[r.start];
    const endT = terminals[r.end];

    // Create variant WITHOUT geometry
    const variant = await prisma.routeVariant.create({
      data: {
        routeId: route.id,
        name: `${r.start} → ${r.end}`,
        direction: "OUTBOUND",
        isDefault: true,
        geometry: null // <-- Left null so the map auto-fetches the real road path
      },
    });

    // Link Terminals
    await prisma.routeTerminal.createMany({
      data: [
        { variantId: variant.id, terminalId: startT.id },
        { variantId: variant.id, terminalId: endT.id },
      ],
    });

    // Link Stops
    let sequence = 1;
    for (const stopName of r.stops) {
      const stop = stops[stopName];
      if (stop) {
        await prisma.routeStop.create({
          data: {
            variantId: variant.id,
            stopId: stop.id,
            sequence: sequence++,
            isTerminal: sequence === 1 || stopName === r.stops[r.stops.length - 1],
          },
        });
      }
    }
  }
  
  console.log(`🛣️  ${routesData.length} routes created (geometry will be auto-generated on map load)`);

  // ─── Fares ───
  await prisma.fare.createMany({
    data: [
      { routeId: (await prisma.route.findUnique({ where: { code: "SP-NAG" } }))!.id, passengerType: "REGULAR", amountMin: 25, amountMax: 25, source: "verified" },
      { routeId: (await prisma.route.findUnique({ where: { code: "SP-LIL" } }))!.id, passengerType: "REGULAR", amountMin: 40, amountMax: 40, source: "verified" },
      { routeId: (await prisma.route.findUnique({ where: { code: "NAG-LIL" } }))!.id, passengerType: "REGULAR", amountMin: 13, amountMax: 13, source: "verified" },
    ],
  });
  console.log("💰 3 fare records created");

  console.log("\n✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });