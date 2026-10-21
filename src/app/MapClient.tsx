// src/app/MapClient.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import MapGL, { Marker, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

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

export default function MapClient({
  terminals,
  variants,
}: {
  terminals: Terminal[];
  variants: Variant[];
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<GeoJSON.LineString | null>(null);
  const [geometryLoading, setGeometryLoading] = useState(false);
  const [geometryError, setGeometryError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!selectedVariant || selectedVariant.stops.length < 2) {
      setRouteGeometry(null);
      setGeometryError(null);
      return;
    }

    if (selectedVariant.geometry) {
      const g = selectedVariant.geometry as GeoJSON.LineString;
      if (g.type === "LineString") {
        setRouteGeometry(g);
        setGeometryError(null);
        return;
      }
    }

    let cancelled = false;
    setGeometryLoading(true);
    setGeometryError(null);
    setRouteGeometry(null);

    const coords = selectedVariant.stops.map(
      (s) => [s.longitude, s.latitude] as [number, number],
    );

    fetch("/api/route-geometry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: selectedVariant.id, coordinates: coords }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load path");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        if (data.geometry?.type === "LineString") {
          setRouteGeometry(data.geometry);
        } else {
          setGeometryError("No path returned");
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setGeometryError(err.message);
      })
      .finally(() => {
        if (!cancelled) setGeometryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedVariant]);

  const center: [number, number] =
    terminals.length > 0
      ? [terminals[0].longitude, terminals[0].latitude]
      : [121.325, 14.067];

  const lineFeature = useMemo(() => {
    if (!routeGeometry) return null;
    return { type: "Feature" as const, properties: {}, geometry: routeGeometry };
  }, [routeGeometry]);

  if (!mounted) {
    return <div className="h-full w-full bg-gray-100" />;
  }

  const handleCloseSidebar = () => {
    setSelectedTerminal(null);
    setSelectedVariant(null);
    setRouteGeometry(null);
  };

  const handleBackToTerminal = () => {
    setSelectedVariant(null);
    setRouteGeometry(null);
  };

  return (
    <div className="relative h-full w-full">
      <MapGL
        initialViewState={{ longitude: center[0], latitude: center[1], zoom: 11 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        onClick={() => {
          if (!selectedVariant) setSelectedTerminal(null);
        }}
      >
        {lineFeature && (
          <Source id="route-line" type="geojson" data={lineFeature as never}>
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
                className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-md"
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
              }}
            >
              <div className="cursor-pointer text-2xl transition-transform hover:scale-110 drop-shadow-md">
                📍
              </div>
            </Marker>
          ))}
      </MapGL>

      {/* Sidebar Panel */}
      <div
        className={`absolute top-0 right-0 z-[1000] h-full w-[340px] transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          selectedTerminal ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedTerminal && (
          <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className="flex items-start justify-between border-b p-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedTerminal.name}
                </h2>
                {selectedTerminal.area && (
                  <p className="text-sm text-gray-500">{selectedTerminal.area}</p>
                )}
              </div>
              <button
                onClick={handleCloseSidebar}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {!selectedVariant ? (
                /* View 1: List of Routes */
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Routes serving this terminal
                  </h3>
                  <div className="space-y-2">
                    {routesForSelectedTerminal.length === 0 && (
                      <p className="text-sm text-gray-400">No routes yet.</p>
                    )}
                    {routesForSelectedTerminal.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className="flex w-full flex-col rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                      >
                        <span className="font-mono text-xs font-semibold text-blue-600">
                          {v.routeCode}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {v.routeName}
                        </span>
                        <span className="text-xs text-gray-500">{v.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* View 2: Route Details & Stops */
                <div>
                  <button
                    onClick={handleBackToTerminal}
                    className="mb-4 text-xs font-medium text-blue-600 hover:underline"
                  >
                    ← Back to routes
                  </button>
                  <div className="mb-4">
                    <span className="font-mono text-sm font-bold text-blue-600">
                      {selectedVariant.routeCode}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">
                      {selectedVariant.routeName}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedVariant.name}</p>
                  </div>

                  {geometryLoading && (
                    <p className="mb-2 text-xs text-blue-600">Loading road path…</p>
                  )}
                  {!geometryLoading && geometryError && (
                    <p className="mb-2 text-xs text-red-600">
                      Path unavailable: {geometryError}
                    </p>
                  )}

                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Stops
                  </h4>
                  <ol className="space-y-3">
                    {selectedVariant.stops.map((s) => (
                      <li key={s.id} className="flex gap-3 text-sm">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                          {s.sequence}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{s.name}</span>
                          {s.landmark && (
                            <span className="text-xs text-gray-500">
                              {s.landmark}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}