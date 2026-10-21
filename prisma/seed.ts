// prisma/seed.ts

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
});

const prisma = new PrismaClient({ adapter });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── DATA FILTER ───
// Set to "ALL" to seed everything, or provide an array of cities to filter.
// Example: const FILTER_CITY = ["Laguna", "Batangas"];
const FILTER_CITY: "ALL" | string[] = "ALL";

// Helper to fetch real road paths from OSRM
async function getOSRMRoute(startLng: number, startLat: number, endLng: number, endLat: number, retries = 3) {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (res.ok) {
        const data = await res.json();
        if (data.code === "Ok" && data.routes?.[0]?.geometry) return data.routes[0].geometry;
        return null;
      }
    } catch {}
    await sleep(1500 * attempt);
  }
  return null;
}

// Helper to snap a coordinate to the nearest drivable road
async function snapToRoad(lng: number, lat: number) {
  const url = `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    if (data.waypoints?.[0]?.location) {
      return data.waypoints[0].location as Coord;
    }
  } catch {}
  return [lng, lat] as Coord;
}

// ─── RoRo ports ───
const ports = {
  BATPORT: { name: "Batangas Port", lat: 13.7500, lng: 121.0460 },
  CALPORT: { name: "Calapan Port", lat: 13.4230, lng: 121.1875 },
  ROXPORT: { name: "Roxas Port (Mindoro)", lat: 12.5910, lng: 121.5240 },
  CATPORT: { name: "Caticlan Port", lat: 11.9210, lng: 121.9530 },
  MATPORT: { name: "Matnog Port", lat: 12.5870, lng: 124.0830 },
  ALLPORT: { name: "Allen Port", lat: 12.5050, lng: 124.2830 },
  LILPORT: { name: "Liloan Port", lat: 10.1500, lng: 125.1300 },
  LIPPORT: { name: "Lipata Port (Surigao)", lat: 9.7870, lng: 125.5040 },
} as const;

type PortKey = keyof typeof ports;
type SeaCrossing = [PortKey, PortKey];
type Coord = [number, number];

async function roadLeg(from: Coord, to: Coord) {
  const geometry = await getOSRMRoute(from[0], from[1], to[0], to[1]);
  await sleep(1100);
  if (geometry?.coordinates?.length) {
    return { coords: geometry.coordinates as Coord[], fallback: false };
  }
  return { coords: [], fallback: true };
}

async function buildGeometry(start: Coord, end: Coord, sea: SeaCrossing[] = []) {
  const geometries: { type: "road" | "ferry"; coordinates: Coord[] }[] = [];
  let fallbacks = 0;
  let current = start;

  for (const [departKey, arriveKey] of sea) {
    const rawDepart: Coord = [ports[departKey].lng, ports[departKey].lat];
    const rawArrive: Coord = [ports[arriveKey].lng, ports[arriveKey].lat];

    // Snap ports to nearest road
    const departRoad = await snapToRoad(rawDepart[0], rawDepart[1]);
    const arriveRoad = await snapToRoad(rawArrive[0], rawArrive[1]);

    // Road to departure port
    const leg = await roadLeg(current, departRoad);
    if (leg.fallback) {
      fallbacks++;
      geometries.push({ type: "road", coordinates: [current, departRoad] });
    } else {
      geometries.push({ type: "road", coordinates: leg.coords });
    }
    
    // Ferry crossing
    geometries.push({ type: "ferry", coordinates: [departRoad, arriveRoad] });
    
    current = arriveRoad;
  }

  // Final road leg
  const lastLeg = await roadLeg(current, end);
  if (lastLeg.fallback) {
    fallbacks++;
    geometries.push({ type: "road", coordinates: [current, end] });
  } else {
    geometries.push({ type: "road", coordinates: lastLeg.coords });
  }

  return { geometry: geometries, fallbacks };
}

// ─── Terminals ───
const terminalsData = [
  // === Laguna Hubs ===
  { key: "SC", city: "Santa Cruz", name: "Santa Cruz Laguna Terminal", area: "Poblacion", lat: 14.2833, lng: 121.4167 },
  { key: "SMSP", city: "San Pablo", name: "SM San Pablo Terminal", area: "Poblacion", lat: 14.0715, lng: 121.3150 },
  { key: "SPB", city: "San Pablo", name: "San Pablo Bayan Terminal", area: "Poblacion", lat: 14.0650, lng: 121.3200 },
  { key: "CALX", city: "Calamba", name: "Calamba Crossing Terminal", area: "Crossing", lat: 14.2117, lng: 121.1653 },
  { key: "SMCAL", city: "Calamba", name: "SM City Calamba Terminal", area: "Crossing", lat: 14.1960, lng: 121.1595 },
  { key: "BIN", city: "Biñan", name: "JAC Liner Biñan Terminal", area: "Sto Domingo", lat: 14.3300, lng: 121.0800 },
  { key: "SRIT", city: "Santa Rosa", name: "Santa Rosa Integrated Terminal (SRIT)", area: "Tagapo", lat: 14.2900, lng: 121.1100 },

  // === Metro Manila Hubs ===
  { key: "PITX", city: "Metro Manila", name: "PITX (Parañaque Integrated Terminal Exchange)", area: "Parañaque", lat: 14.5100, lng: 120.9917 },
  { key: "CUB", city: "Metro Manila", name: "EDSA-Cubao Bus Terminal", area: "Quezon City", lat: 14.6194, lng: 121.0531 },
  { key: "ARA", city: "Metro Manila", name: "Araneta City Bus Port", area: "Cubao, Quezon City", lat: 14.6208, lng: 121.0545 },
  { key: "VLC", city: "Metro Manila", name: "Victory Liner Cubao Terminal", area: "Cubao, Quezon City", lat: 14.6225, lng: 121.0560 },
  { key: "VLK", city: "Metro Manila", name: "Victory Liner Caloocan Terminal", area: "Monumento, Caloocan", lat: 14.6540, lng: 120.9840 },
  { key: "TRAMO", city: "Metro Manila", name: "Pasay Tramo Terminal", area: "Pasay", lat: 14.5375, lng: 121.0000 },
  { key: "VLP", city: "Metro Manila", name: "Victory Liner Pasay Terminal", area: "Pasay", lat: 14.5385, lng: 121.0005 },
  { key: "BUE", city: "Metro Manila", name: "Buendia (Gil Puyat) Terminal", area: "Pasay", lat: 14.5600, lng: 120.9900 },
  { key: "ALA", city: "Metro Manila", name: "Alabang Bus Station (Star Mall)", area: "Muntinlupa", lat: 14.4200, lng: 121.0400 },

  // === North Luzon Hubs ===
  { key: "BAG", city: "Baguio", name: "Baguio Governor Pack Terminal", area: "Baguio City", lat: 16.4100, lng: 120.6000 },
  { key: "DANG", city: "Baguio", name: "Dangwa Baguio Terminal", area: "Baguio City", lat: 16.4200, lng: 120.5960 },
  { key: "VLB", city: "Baguio", name: "Victory Liner Baguio Terminal", area: "Baguio City", lat: 16.4130, lng: 120.5930 },
  { key: "DAG", city: "Dagupan", name: "Dagupan Bus Terminal", area: "Pangasinan", lat: 16.0430, lng: 120.3330 },
  { key: "VLD", city: "Dagupan", name: "Dagupan Victory Liner Terminal", area: "Pangasinan", lat: 16.0455, lng: 120.3395 },
  { key: "OLO", city: "Olongapo", name: "Olongapo Victory Liner Terminal", area: "Zambales", lat: 14.8300, lng: 120.2800 },
  { key: "DAU", city: "Pampanga", name: "Angeles Dau Bus Terminal", area: "Mabalacat", lat: 15.1700, lng: 120.5950 },
  { key: "SFP", city: "Pampanga", name: "San Fernando Pampanga Terminal", area: "San Fernando", lat: 15.0340, lng: 120.6890 },
  { key: "CAB", city: "Cabanatuan", name: "Cabanatuan Bus Terminal", area: "Nueva Ecija", lat: 15.4880, lng: 120.9690 },
  { key: "BAL", city: "Baler", name: "Baler Bus Terminal", area: "Aurora", lat: 15.7590, lng: 121.5630 },
  { key: "TUG", city: "Tuguegarao", name: "Tuguegarao Bus Terminal", area: "Cagayan", lat: 17.6130, lng: 121.7270 },
  { key: "LAO", city: "Laoag", name: "Laoag Bus Terminal", area: "Ilocos Norte", lat: 18.1980, lng: 120.5930 },
  { key: "VIG", city: "Vigan", name: "Vigan Bus Terminal", area: "Ilocos Sur", lat: 17.5747, lng: 120.3870 },

  // === South Luzon Hubs ===
  { key: "BAT", city: "Batangas", name: "Batangas Grand Terminal", area: "Batangas City", lat: 13.7565, lng: 121.0583 },
  { key: "BPIER", city: "Batangas", name: "Batangas Pier Terminal", area: "Batangas City", lat: 13.7500, lng: 121.0460 },
  { key: "LIPA", city: "Batangas", name: "Lipa Grand Terminal", area: "Lipa City", lat: 13.9440, lng: 121.1640 },
  { key: "TAG", city: "Tagaytay", name: "Tagaytay Olivarez Terminal", area: "Tagaytay", lat: 14.1120, lng: 120.9600 },
  { key: "LUC", city: "Lucena", name: "Lucena Grand Terminal", area: "Quezon", lat: 13.9333, lng: 121.6167 },
  { key: "NAG", city: "Naga", name: "Naga City Terminal", area: "Camarines Sur", lat: 13.6218, lng: 123.1948 },
  { key: "LEG", city: "Legazpi", name: "Legazpi Terminal", area: "Albay", lat: 13.1391, lng: 123.7438 },

  // === Visayas & Mindanao Hubs ===
  { key: "CEBS", city: "Cebu", name: "Cebu South Bus Terminal", area: "Cebu City", lat: 10.2990, lng: 123.8930 },
  { key: "CEBN", city: "Cebu", name: "Cebu North Bus Terminal", area: "Mandaue", lat: 10.3410, lng: 123.9350 },
  { key: "ILO", city: "Iloilo", name: "Iloilo Ceres Tagbak Terminal", area: "Jaro, Iloilo City", lat: 10.7130, lng: 122.5380 },
  { key: "DAV", city: "Davao", name: "Davao Overland Transport Terminal (Ecoland)", area: "Davao City", lat: 7.0540, lng: 125.6040 },

  // === RoRo Destinations ===
  { key: "CALP", city: "Calapan", name: "Calapan Bus Terminal", area: "Oriental Mindoro", lat: 13.4118, lng: 121.1803 },
  { key: "CATI", city: "Caticlan", name: "Caticlan Bus Terminal", area: "Malay, Aklan", lat: 11.9300, lng: 121.9540 },
  { key: "KAL", city: "Kalibo", name: "Kalibo Bus Terminal", area: "Aklan", lat: 11.7050, lng: 122.3660 },
  { key: "TAC", city: "Tacloban", name: "Tacloban Bus Terminal", area: "Leyte", lat: 11.2470, lng: 125.0020 },
] as const;

type TerminalKey = (typeof terminalsData)[number]["key"];

type RouteSeed = {
  code: string;
  name: string;
  from: TerminalKey;
  to: TerminalKey;
  fare: number;
  city?: string;
  sea?: SeaCrossing[];
};

const routesData: RouteSeed[] = [
  { code: "SC-PITX", name: "Santa Cruz – PITX", from: "SC", to: "PITX", fare: 200 },
  { code: "SC-CUB", name: "Santa Cruz – Cubao", from: "SC", to: "CUB", fare: 200 },
  { code: "SC-BUE", name: "Santa Cruz – Buendia", from: "SC", to: "BUE", fare: 200 },
  { code: "SC-ALA", name: "Santa Cruz – Alabang", from: "SC", to: "ALA", fare: 150 },
  { code: "SC-SP", name: "Santa Cruz – San Pablo", from: "SC", to: "SMSP", fare: 90, city: "Santa Cruz" },
  { code: "SC-CAL", name: "Santa Cruz – Calamba", from: "SC", to: "CALX", fare: 100, city: "Santa Cruz" },
  { code: "SP-PITX", name: "San Pablo – PITX", from: "SMSP", to: "PITX", fare: 180 },
  { code: "SP-CUB", name: "San Pablo – Cubao", from: "SMSP", to: "CUB", fare: 180 },
  { code: "SP-BUE", name: "San Pablo – Buendia", from: "SMSP", to: "BUE", fare: 180 },
  { code: "SP-ALA", name: "San Pablo – Alabang", from: "SMSP", to: "ALA", fare: 150 },
  { code: "SP-LUC", name: "San Pablo – Lucena", from: "SMSP", to: "LUC", fare: 100 },
  { code: "SP-CAL", name: "San Pablo – Calamba", from: "SMSP", to: "CALX", fare: 80, city: "San Pablo" },
  { code: "SPB-SC", name: "San Pablo Bayan – Santa Cruz", from: "SPB", to: "SC", fare: 90, city: "San Pablo" },
  { code: "SPB-PITX", name: "San Pablo Bayan – PITX", from: "SPB", to: "PITX", fare: 180 },
  { code: "SPB-CUB", name: "San Pablo Bayan – Cubao", from: "SPB", to: "CUB", fare: 180 },
  { code: "SPB-LUC", name: "San Pablo Bayan – Lucena", from: "SPB", to: "LUC", fare: 100, city: "San Pablo" },
  { code: "CAL-PITX", name: "Calamba – PITX", from: "CALX", to: "PITX", fare: 100 },
  { code: "CAL-CUB", name: "Calamba – Cubao", from: "CALX", to: "CUB", fare: 100 },
  { code: "CAL-BUE", name: "Calamba – Buendia", from: "CALX", to: "BUE", fare: 100 },
  { code: "CAL-ALA", name: "Calamba – Alabang", from: "CALX", to: "ALA", fare: 70 },
  { code: "CAL-TAG", name: "Calamba – Tagaytay", from: "CALX", to: "TAG", fare: 70, city: "Calamba" },
  { code: "CAL-BAT", name: "Calamba – Batangas", from: "CALX", to: "BAT", fare: 150, city: "Calamba" },
  { code: "CAL-LIP", name: "Calamba – Lipa", from: "CALX", to: "LIPA", fare: 100, city: "Calamba" },
  { code: "SMC-PITX", name: "SM Calamba – PITX", from: "SMCAL", to: "PITX", fare: 100 },
  { code: "SMC-CUB", name: "SM Calamba – Cubao", from: "SMCAL", to: "CUB", fare: 100 },
  { code: "SMC-BUE", name: "SM Calamba – Buendia", from: "SMCAL", to: "BUE", fare: 100 },
  { code: "SMC-ALA", name: "SM Calamba – Alabang", from: "SMCAL", to: "ALA", fare: 70 },
  { code: "BIN-BUE", name: "Biñan – Buendia", from: "BIN", to: "BUE", fare: 80 },
  { code: "BIN-CUB", name: "Biñan – Cubao", from: "BIN", to: "CUB", fare: 80 },
  { code: "BIN-PITX", name: "Biñan – PITX", from: "BIN", to: "PITX", fare: 80 },
  { code: "BIN-ALA", name: "Biñan – Alabang", from: "BIN", to: "ALA", fare: 60 },
  { code: "SRO-PITX", name: "Santa Rosa – PITX", from: "SRIT", to: "PITX", fare: 80 },
  { code: "SRO-CUB", name: "Santa Rosa – Cubao", from: "SRIT", to: "CUB", fare: 80 },
  { code: "SRO-BUE", name: "Santa Rosa – Buendia", from: "SRIT", to: "BUE", fare: 80 },
  { code: "SRO-ALA", name: "Santa Rosa – Alabang", from: "SRIT", to: "ALA", fare: 60 },
  { code: "SRO-TAG", name: "Santa Rosa – Tagaytay", from: "SRIT", to: "TAG", fare: 70, city: "Santa Rosa" },
  { code: "PITX-BAG", name: "PITX – Baguio", from: "PITX", to: "BAG", fare: 750 },
  { code: "PITX-BAT", name: "PITX – Batangas", from: "PITX", to: "BAT", fare: 250 },
  { code: "PITX-BPR", name: "PITX – Batangas Pier", from: "PITX", to: "BPIER", fare: 270 },
  { code: "PITX-LIP", name: "PITX – Lipa", from: "PITX", to: "LIPA", fare: 230 },
  { code: "PITX-TAG", name: "PITX – Tagaytay", from: "PITX", to: "TAG", fare: 130 },
  { code: "PITX-LUC", name: "PITX – Lucena", from: "PITX", to: "LUC", fare: 300 },
  { code: "PITX-NAG", name: "PITX – Naga", from: "PITX", to: "NAG", fare: 900 },
  { code: "PITX-LEG", name: "PITX – Legazpi", from: "PITX", to: "LEG", fare: 1300 },
  { code: "CUB-BAG", name: "Cubao – Baguio", from: "CUB", to: "BAG", fare: 700 },
  { code: "CUB-DAG", name: "Cubao – Dagupan", from: "CUB", to: "DAG", fare: 480 },
  { code: "CUB-OLO", name: "Cubao – Olongapo", from: "CUB", to: "OLO", fare: 380 },
  { code: "CUB-SFP", name: "Cubao – San Fernando (Pampanga)", from: "CUB", to: "SFP", fare: 230 },
  { code: "CUB-ANG", name: "Cubao – Angeles (Dau)", from: "CUB", to: "DAU", fare: 280 },
  { code: "CUB-CAB", name: "Cubao – Cabanatuan", from: "CUB", to: "CAB", fare: 330 },
  { code: "CUB-BAL", name: "Cubao – Baler", from: "CUB", to: "BAL", fare: 480 },
  { code: "CUB-TUG", name: "Cubao – Tuguegarao", from: "CUB", to: "TUG", fare: 1000 },
  { code: "CUB-LAO", name: "Cubao – Laoag", from: "CUB", to: "LAO", fare: 1050 },
  { code: "CUB-VIG", name: "Cubao – Vigan", from: "CUB", to: "VIG", fare: 950 },
  { code: "CUB-LUC", name: "Cubao – Lucena", from: "CUB", to: "LUC", fare: 300 },
  { code: "CUB-NAG", name: "Cubao – Naga", from: "CUB", to: "NAG", fare: 1100 },
  { code: "CUB-LEG", name: "Cubao – Legazpi", from: "CUB", to: "LEG", fare: 1500 },
  { code: "ARA-BAG", name: "Araneta Bus Port – Baguio", from: "ARA", to: "BAG", fare: 750 },
  { code: "ARA-DAG", name: "Araneta Bus Port – Dagupan", from: "ARA", to: "DAG", fare: 500 },
  { code: "ARA-CAB", name: "Araneta Bus Port – Cabanatuan", from: "ARA", to: "CAB", fare: 330 },
  { code: "ARA-BAL", name: "Araneta Bus Port – Baler", from: "ARA", to: "BAL", fare: 480 },
  { code: "VLC-BAG", name: "Victory Liner Cubao – Baguio", from: "VLC", to: "VLB", fare: 700 },
  { code: "VLC-DAG", name: "Victory Liner Cubao – Dagupan", from: "VLC", to: "VLD", fare: 480 },
  { code: "VLC-OLO", name: "Victory Liner Cubao – Olongapo", from: "VLC", to: "OLO", fare: 380 },
  { code: "VLC-SFP", name: "Victory Liner Cubao – San Fernando", from: "VLC", to: "SFP", fare: 230 },
  { code: "VLC-TUG", name: "Victory Liner Cubao – Tuguegarao", from: "VLC", to: "TUG", fare: 950 },
  { code: "VLC-BAL", name: "Victory Liner Cubao – Baler", from: "VLC", to: "BAL", fare: 480 },
  { code: "VLC-CAB", name: "Victory Liner Cubao – Cabanatuan", from: "VLC", to: "CAB", fare: 330 },
  { code: "VLK-BAG", name: "Victory Liner Caloocan – Baguio", from: "VLK", to: "VLB", fare: 700 },
  { code: "VLK-DAG", name: "Victory Liner Caloocan – Dagupan", from: "VLK", to: "VLD", fare: 480 },
  { code: "VLK-OLO", name: "Victory Liner Caloocan – Olongapo", from: "VLK", to: "OLO", fare: 380 },
  { code: "VLK-SFP", name: "Victory Liner Caloocan – San Fernando", from: "VLK", to: "SFP", fare: 230 },
  { code: "VLK-ANG", name: "Victory Liner Caloocan – Angeles (Dau)", from: "VLK", to: "DAU", fare: 250 },
  { code: "VLP-BAG", name: "Victory Liner Pasay – Baguio", from: "VLP", to: "VLB", fare: 750 },
  { code: "VLP-OLO", name: "Victory Liner Pasay – Olongapo", from: "VLP", to: "OLO", fare: 400 },
  { code: "VLP-DAG", name: "Victory Liner Pasay – Dagupan", from: "VLP", to: "VLD", fare: 520 },
  { code: "TRA-BAT", name: "Pasay Tramo – Batangas", from: "TRAMO", to: "BAT", fare: 250 },
  { code: "TRA-CAL", name: "Pasay Tramo – Calamba", from: "TRAMO", to: "CALX", fare: 100 },
  { code: "TRA-LUC", name: "Pasay Tramo – Lucena", from: "TRAMO", to: "LUC", fare: 300 },
  { code: "TRA-NAG", name: "Pasay Tramo – Naga", from: "TRAMO", to: "NAG", fare: 950 },
  { code: "TRA-LEG", name: "Pasay Tramo – Legazpi", from: "TRAMO", to: "LEG", fare: 1250 },
  { code: "BUE-BAT", name: "Buendia – Batangas", from: "BUE", to: "BAT", fare: 250 },
  { code: "BUE-BPR", name: "Buendia – Batangas Pier", from: "BUE", to: "BPIER", fare: 270 },
  { code: "BUE-LIP", name: "Buendia – Lipa", from: "BUE", to: "LIPA", fare: 230 },
  { code: "BUE-TAG", name: "Buendia – Tagaytay", from: "BUE", to: "TAG", fare: 150 },
  { code: "BUE-LUC", name: "Buendia – Lucena", from: "BUE", to: "LUC", fare: 300 },
  { code: "BUE-NAG", name: "Buendia – Naga", from: "BUE", to: "NAG", fare: 950 },
  { code: "BUE-LEG", name: "Buendia – Legazpi", from: "BUE", to: "LEG", fare: 1250 },
  { code: "ALA-BAT", name: "Alabang – Batangas", from: "ALA", to: "BAT", fare: 220 },
  { code: "ALA-LIP", name: "Alabang – Lipa", from: "ALA", to: "LIPA", fare: 170 },
  { code: "ALA-TAG", name: "Alabang – Tagaytay", from: "ALA", to: "TAG", fare: 100 },
  { code: "DAG-BAG", name: "Dagupan – Baguio", from: "DAG", to: "BAG", fare: 200, city: "Dagupan" },
  { code: "VLD-VLB", name: "Dagupan (Victory Liner) – Baguio (Victory Liner)", from: "VLD", to: "VLB", fare: 220, city: "Dagupan" },
  { code: "DANG-DAG", name: "Dangwa Baguio – Dagupan", from: "DANG", to: "DAG", fare: 200, city: "Baguio" },
  { code: "DAG-VIG", name: "Dagupan – Vigan", from: "DAG", to: "VIG", fare: 280, city: "Dagupan" },
  { code: "DAG-LAO", name: "Dagupan – Laoag", from: "DAG", to: "LAO", fare: 450, city: "Dagupan" },
  { code: "VIG-LAO", name: "Vigan – Laoag", from: "VIG", to: "LAO", fare: 150, city: "Vigan" },
  { code: "VLB-ANG", name: "Baguio – Angeles (Dau)", from: "VLB", to: "DAU", fare: 400, city: "Baguio" },
  { code: "DAU-DAG", name: "Angeles (Dau) – Dagupan", from: "DAU", to: "DAG", fare: 300, city: "Pampanga" },
  { code: "DAU-OLO", name: "Angeles (Dau) – Olongapo", from: "DAU", to: "OLO", fare: 150, city: "Pampanga" },
  { code: "SFP-OLO", name: "San Fernando – Olongapo", from: "SFP", to: "OLO", fare: 130, city: "Pampanga" },
  { code: "CAB-BAL", name: "Cabanatuan – Baler", from: "CAB", to: "BAL", fare: 280, city: "Cabanatuan" },
  { code: "CAB-SFP", name: "Cabanatuan – San Fernando", from: "CAB", to: "SFP", fare: 150, city: "Cabanatuan" },
  { code: "CAB-DAU", name: "Cabanatuan – Angeles (Dau)", from: "CAB", to: "DAU", fare: 150, city: "Cabanatuan" },
  { code: "TUG-CAB", name: "Tuguegarao – Cabanatuan", from: "TUG", to: "CAB", fare: 600, city: "Tuguegarao" },
  { code: "BAT-LIP", name: "Batangas – Lipa", from: "BAT", to: "LIPA", fare: 100, city: "Batangas" },
  { code: "BAT-TAG", name: "Batangas – Tagaytay", from: "BAT", to: "TAG", fare: 150, city: "Batangas" },
  { code: "BAT-LUC", name: "Batangas – Lucena", from: "BAT", to: "LUC", fare: 180, city: "Batangas" },
  { code: "BPR-LIP", name: "Batangas Pier – Lipa", from: "BPIER", to: "LIPA", fare: 120, city: "Batangas" },
  { code: "LIP-TAG", name: "Lipa – Tagaytay", from: "LIPA", to: "TAG", fare: 90, city: "Batangas" },
  { code: "LUC-NAG", name: "Lucena – Naga", from: "LUC", to: "NAG", fare: 450, city: "Lucena" },
  { code: "LUC-LEG", name: "Lucena – Legazpi", from: "LUC", to: "LEG", fare: 650, city: "Lucena" },
  { code: "NAG-LEG", name: "Naga – Legazpi", from: "NAG", to: "LEG", fare: 150, city: "Naga" },
  { code: "CEB-NS", name: "Cebu South – Cebu North", from: "CEBS", to: "CEBN", fare: 80, city: "Cebu" },
  { code: "PITX-CLP", name: "PITX – Calapan (RoRo)", from: "PITX", to: "CALP", fare: 550, sea: [["BATPORT", "CALPORT"]] },
  { code: "BUE-CLP", name: "Buendia – Calapan (RoRo)", from: "BUE", to: "CALP", fare: 550, sea: [["BATPORT", "CALPORT"]] },
  { code: "PITX-CAT", name: "PITX – Caticlan (RoRo)", from: "PITX", to: "CATI", fare: 1200, sea: [["BATPORT", "CALPORT"], ["ROXPORT", "CATPORT"]] },
  { code: "BUE-CAT", name: "Buendia – Caticlan (RoRo)", from: "BUE", to: "CATI", fare: 1200, sea: [["BATPORT", "CALPORT"], ["ROXPORT", "CATPORT"]] },
  { code: "PITX-KAL", name: "PITX – Kalibo (RoRo)", from: "PITX", to: "KAL", fare: 1250, sea: [["BATPORT", "CALPORT"], ["ROXPORT", "CATPORT"]] },
  { code: "PITX-ILO", name: "PITX – Iloilo (RoRo)", from: "PITX", to: "ILO", fare: 1800, sea: [["BATPORT", "CALPORT"], ["ROXPORT", "CATPORT"]] },
  { code: "BUE-ILO", name: "Buendia – Iloilo (RoRo)", from: "BUE", to: "ILO", fare: 1800, sea: [["BATPORT", "CALPORT"], ["ROXPORT", "CATPORT"]] },
  { code: "LEG-TAC", name: "Legazpi – Tacloban (RoRo)", from: "LEG", to: "TAC", fare: 750, city: "Legazpi", sea: [["MATPORT", "ALLPORT"]] },
  { code: "TRA-TAC", name: "Pasay Tramo – Tacloban (RoRo)", from: "TRAMO", to: "TAC", fare: 1800, sea: [["MATPORT", "ALLPORT"]] },
  { code: "PITX-TAC", name: "PITX – Tacloban (RoRo)", from: "PITX", to: "TAC", fare: 1850, sea: [["MATPORT", "ALLPORT"]] },
  { code: "TRA-DAV", name: "Pasay Tramo – Davao (RoRo)", from: "TRAMO", to: "DAV", fare: 3500, sea: [["MATPORT", "ALLPORT"], ["LILPORT", "LIPPORT"]] },
  { code: "TAC-DAV", name: "Tacloban – Davao (RoRo)", from: "TAC", to: "DAV", fare: 1500, city: "Tacloban", sea: [["LILPORT", "LIPPORT"]] },
];

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

  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.admin.create({
    data: { email: "admin@example.com", passwordHash, name: "Admin" },
  });

  // Filter logic
  const citiesToSeed = new Set<string>();
  terminalsData.forEach(t => citiesToSeed.add(t.city));

  if (FILTER_CITY !== "ALL") {
    const allowed = new Set(FILTER_CITY);
    for (const c of Array.from(citiesToSeed)) {
      if (!allowed.has(c)) citiesToSeed.delete(c);
    }
  }

  console.log(`🏙️  Seeding ${citiesToSeed.size} cities/regions...`);
  const cities: Record<string, any> = {};
  for (const name of Array.from(citiesToSeed)) {
    cities[name] = await prisma.city.create({ data: { name, region: "Philippines" } });
  }

  const terminals: Record<string, any> = {};
  for (const data of terminalsData) {
    if (!cities[data.city]) continue; // skip filtered out cities
    const t = await prisma.terminal.create({
      data: {
        cityId: cities[data.city].id,
        name: data.name,
        area: data.area,
        latitude: data.lat,
        longitude: data.lng,
      },
    });
    terminals[data.key] = t;
  }
  console.log(`🏢 ${Object.keys(terminals).length} bus terminals created`);

  let fallbackCount = 0;
  let routesSeeded = 0;

  for (const r of routesData) {
    const startT = terminals[r.from];
    const endT = terminals[r.to];

    // Skip if either terminal wasn't seeded (due to city filter)
    if (!startT || !endT) continue;

    const cityName = r.city ?? startT.cityId; // fallback to start terminal's city
    const city = cities[cityName] ?? Object.values(cities)[0]; // fallback to any available city
    if (!city) continue;

    const route = await prisma.route.create({
      data: { code: r.code, name: r.name, cityId: city.id },
    });

    console.log(`⏳ Fetching path for ${r.code}...`);
    const { geometry, fallbacks } = await buildGeometry(
      [startT.longitude, startT.latitude],
      [endT.longitude, endT.latitude],
      r.sea
    );
    if (fallbacks > 0) fallbackCount += fallbacks;

    const variant = await prisma.routeVariant.create({
      data: {
        routeId: route.id,
        name: `${startT.name} → ${endT.name}`,
        direction: "OUTBOUND",
        isDefault: true,
        geometry, 
      },
    });

    await prisma.routeTerminal.createMany({
      data: [
        { variantId: variant.id, terminalId: startT.id },
        { variantId: variant.id, terminalId: endT.id },
      ],
    });

    await prisma.fare.create({
      data: {
        routeId: route.id,
        passengerType: "REGULAR",
        amountMin: r.fare,
        amountMax: r.fare,
        source: "estimated_2025",
      },
    });
    
    routesSeeded++;
  }

  console.log(`🛣️  ${routesSeeded} bus routes created with road paths`);
  if (fallbackCount > 0) {
    console.log(`   (${fallbackCount} road legs used a straight-line fallback path)`);
  }

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