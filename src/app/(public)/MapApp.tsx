// src/app/(public)/MapApp.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Map, { Marker, Popup, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";

if (typeof window !== "undefined") {
  maplibregl.setWorkerUrl(
    new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString()
  );
}

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

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

export default function MapApp({
  terminals,
  variants,
}: {
  terminals: Terminal[];
  variants: Variant[];
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  useEffect(() => setMounted(true), []);

  const variantById = useMemo(
    () => new Map(variants.map((v) => [v.id, v])),
    [variants],
  );

  const routesForSelectedTerminal = useMemo(() => {
    if (!selectedTerminal) return [];
    return selectedTerminal.variantIds
      .map((id) => variantById.get(id))
      .filter((v): v is Variant => Boolean(v));
  }, [selectedTerminal, variantById]);

  const lineGeoJson = useMemo(() => {
    if (!selectedVariant) return null;
    if (selectedVariant.geometry) return selectedVariant.geometry;
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: selectedVariant.stops.map((s) => [s.longitude, s.latitude]),
      },
    };
  }, [selectedVariant]);

  const center: [number, number] =
    terminals.length > 0
      ? [terminals[0].longitude, terminals[0].latitude]
      : [121.325, 14.067];

  if (!mounted) {
    return <div className="h-screen w-screen bg-gray-100" />;
  }

  return (
    <div className="relative h-screen w-screen">
      <Map
        initialViewState={{ longitude: center[0], latitude: center[1], zoom: 11 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        onClick={() => {
          if (selectedTerminal && !selectedVariant) setSelectedTerminal(null);
        }}
      >
        {lineGeoJson && (
          <Source id="route-line" type="geojson" data={lineGeoJson as never}>
            <Layer
              id="route-line-layer"
              type="line"
              paint={{ "line-color": "#2563eb", "line-width": 4 }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </Source>
        )}

        {selectedVariant &&
          selectedVariant.stops.map((s) => (
            <Marker
              key={s.id}
              longitude={s.longitude}
              latitude={s.latitude}
              anchor="center"
            >
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white"
                title={`${s.sequence}. ${s.name}`}
              >
                {s.sequence}
              </div>
            </Marker>
          ))}

        {!selectedVariant &&
          terminals.map((t) => (
            <Marker
              key={t.id}
              longitude={t.longitude}
              latitude={t.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedTerminal(t);
                setSelectedVariant(null);
              }}
            >
              <div className="cursor-pointer text-2xl">📍</div>
            </Marker>
          ))}

        {selectedTerminal && !selectedVariant && (
          <Popup
            longitude={selectedTerminal.longitude}
            latitude={selectedTerminal.latitude}
            anchor="top"
            onClose={() => setSelectedTerminal(null)}
            closeOnClick={false}
            maxWidth="320px"
          >
            <div className="p-1">
              <p className="font-semibold">{selectedTerminal.name}</p>
              {selectedTerminal.area && (
                <p className="text-xs text-gray-600">{selectedTerminal.area}</p>
              )}
              <div className="mt-2 space-y-1">
                {routesForSelectedTerminal.length === 0 && (
                  <p className="text-xs text-gray-400">No routes yet.</p>
                )}
                {routesForSelectedTerminal.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className="block w-full rounded bg-blue-50 px-2 py-1 text-left text-sm text-blue-700 hover:bg-blue-100"
                  >
                    <span className="font-mono text-xs">{v.routeCode}</span>{" "}
                    {v.routeName}
                    <span className="block text-[11px] text-gray-500">
                      {v.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {selectedVariant && (
        <div className="absolute bottom-4 left-1/2 z-[1000] w-[min(90vw,420px)] -translate-x-1/2 rounded-lg bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-xs text-gray-500">
                {selectedVariant.routeCode}
              </p>
              <p className="font-semibold">{selectedVariant.routeName}</p>
              <p className="text-sm text-gray-600">{selectedVariant.name}</p>
            </div>
            <button
              onClick={() => setSelectedVariant(null)}
              className="text-sm text-gray-500 hover:text-gray-800"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <ol className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm">
            {selectedVariant.stops.map((s) => (
              <li key={s.id} className="flex gap-2">
                <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {s.sequence}
                </span>
                <span>
                  {s.name}
                  {s.landmark && (
                    <span className="text-gray-500"> — {s.landmark}</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}