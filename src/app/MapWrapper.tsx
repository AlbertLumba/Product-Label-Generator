// src/app/MapWrapper.tsx

"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100" />,
});

type Terminal = {
  id: string;
  name: string;
  area: string | null;
  latitude: number;
  longitude: number;
  variantIds: string[];
};

type Stop = {
  id: string;
  name: string;
  landmark: string | null;
  latitude: number;
  longitude: number;
  sequence: number;
  isTerminal: boolean;
};

type Variant = {
  id: string;
  name: string;
  direction: string;
  geometry: { type: string; coordinates: unknown } | null;
  routeCode: string;
  routeName: string;
  stops: Stop[];
};

export default function MapWrapper({
  terminals,
  variants,
}: {
  terminals: Terminal[];
  variants: Variant[];
}) {
  return (
    <div className="h-full w-full">
      <MapClient terminals={terminals} variants={variants} />
    </div>
  );
}