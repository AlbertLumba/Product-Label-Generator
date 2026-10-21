// src/app/(protected)/map/AdminMap.tsx

"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import MapGL, { Marker, Source, Layer } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

type Terminal = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  variantIds: string[];
};

type Variant = {
  id: string;
  name: string;
  direction: string;
  geometry: any;
  routeCode: string;
  routeName: string;
  terminalIds: string[];
  stops: {
    sequence: number;
    isTerminal: boolean;
    id: string;
    name: string;
    landmark: string | null;
    latitude: number;
    longitude: number;
  }[];
};

export default function AdminMap({
  initialTerminals = [],
  initialVariants = [],
}: {
  initialTerminals: Terminal[];
  initialVariants: Variant[];
}) {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const directionsRef = useRef<MapLibreGlDirections | null>(null);
  
  const [terminals, setTerminals] = useState(initialTerminals);
  const [variants, setVariants] = useState(initialVariants);
  
  const [mode, setMode] = useState<"idle" | "add-terminal" | "add-route">("idle");
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [focusedRoute, setFocusedRoute] = useState<Variant | null>(null);

  const [draggedTerminal, setDraggedTerminal] = useState<Terminal | null>(null);
  const [newDragPos, setNewDragPos] = useState<{ lat: number; lng: number } | null>(null);

  const [routeStart, setRouteStart] = useState<Terminal | null>(null);
  const [routeEnd, setRouteEnd] = useState<Terminal | null>(null);
  const [autoPath, setAutoPath] = useState<[number, number][] | null>(null);
  const [fetchingPath, setFetchingPath] = useState(false);

  const [editingRoute, setEditingRoute] = useState<Variant | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const selectedRoutes = selectedTerminal
    ? selectedTerminal.variantIds
        .map((id) => variants.find((v) => v.id === id))
        .filter((v): v is Variant => Boolean(v))
    : [];

  const connectedTerminalIds = useMemo(() => {
    if (!selectedTerminal) return new Set<string>();
    const ids = new Set<string>();
    ids.add(selectedTerminal.id);
    selectedRoutes.forEach((route) => {
      route.terminalIds.forEach((id) => ids.add(id));
    });
    return ids;
  }, [selectedTerminal, selectedRoutes]);

  const onMapLoad = () => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    const directions = new MapLibreGlDirections(map, {
      api: "https://router.project-osrm.org/route/v1/driving/",
      profile: "driving",
      styles: [{ id: "directions-line", type: "line", paint: { "line-color": "#f59e0b", "line-width": 5 } }],
    });
    directions.interactive = false;
    directionsRef.current = directions;
  };

  // Helper to fetch the real road path after a drag
  async function fetchRoadPathFromOSRM(start: Terminal, end: Terminal) {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.routes?.[0]?.geometry || null;
    } catch {
      return null;
    }
  }

  function resetForm() {
    setMode("idle");
    setSelectedPos(null);
    setSelectedTerminal(null);
    setFocusedRoute(null);
    setRouteStart(null);
    setRouteEnd(null);
    setAutoPath(null);
    setEditingRoute(null);
    setName("");
    setCode("");
    setRouteError(null);
    if (directionsRef.current) {
      directionsRef.current.clear();
      directionsRef.current.interactive = false;
    }
  }

  async function fetchRoadPath(start: Terminal, end: Terminal) {
    setFetchingPath(true);
    setAutoPath(null);
    setRouteError(null);

    const startLng = Number(start.longitude);
    const startLat = Number(start.latitude);
    const endLng = Number(end.longitude);
    const endLat = Number(end.latitude);

    if (isNaN(startLng) || isNaN(startLat) || isNaN(endLng) || isNaN(endLat)) {
      setRouteError("Invalid coordinates.");
      setFetchingPath(false);
      return;
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes?.[0]?.geometry?.coordinates) {
        setAutoPath(data.routes[0].geometry.coordinates);
      } else {
        setRouteError("Could not find a road path.");
      }
    } catch {
      setRouteError("Error fetching route.");
    } finally {
      setFetchingPath(false);
    }
  }

  function startEditingRoute(route: Variant) {
    if (!directionsRef.current) return;
    setEditingRoute(route);
    setFocusedRoute(null);
    directionsRef.current.clear();

    if (route.geometry?.coordinates) {
      const coords = route.geometry.coordinates;
      const start = coords[0];
      const end = coords[coords.length - 1];
      if (start && end) {
        directionsRef.current.interactive = true;
        directionsRef.current.setWaypoints([start, end]);
      }
    }
  }

  async function handleSaveEditedRoute() {
    if (!directionsRef.current || !editingRoute) return;
    const routes = directionsRef.current.getRoutes();
    if (!routes || routes.length === 0) {
      setRouteError("No route found.");
      return;
    }

    const newGeometry = routes[0].geometry;
    setSaving(true);
    await fetch("/api/admin/save", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingRoute.id, geometry: newGeometry }),
    });

    setVariants((prev) => prev.map((v) => (v.id === editingRoute.id ? { ...v, geometry: newGeometry } : v)));
    setSaving(false);
    cancelEditing();
    router.refresh();
  }

  function cancelEditing() {
    if (directionsRef.current) {
      directionsRef.current.clear();
      directionsRef.current.interactive = false;
    }
    setEditingRoute(null);
  }

  async function handleSaveNewRoute(e: React.FormEvent) {
    e.preventDefault();
    if (!routeStart || !routeEnd || !autoPath || !code || !name) return;
    setSaving(true);
    await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "createRoute",
        code,
        name,
        startId: routeStart.id,
        endId: routeEnd.id,
        geometry: { type: "LineString", coordinates: autoPath },
      }),
    });
    setSaving(false);
    resetForm();
    router.refresh();
  }

  function generateRouteDetails(start: Terminal, end: Terminal) {
    const startPrefix = start.name.substring(0, 3).toUpperCase();
    const endPrefix = end.name.substring(0, 3).toUpperCase();
    setCode(`${startPrefix}-${endPrefix}`);
    setName(`${start.name} – ${end.name}`);
  }

  async function handleSaveTerminal(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPos || !name) return;
    setSaving(true);
    await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "createTerminal", name, lat: selectedPos.lat, lng: selectedPos.lng }),
    });
    setSaving(false);
    resetForm();
    router.refresh();
  }

  // --- FIXED: Handle drag save with auto-route recalculation ---
  async function handleConfirmMove() {
    if (!draggedTerminal || !newDragPos) return;
    setSaving(true);

    // 1. Update local terminal state instantly
    const updatedTerminals = terminals.map((t) => 
      t.id === draggedTerminal.id ? { ...t, ...newDragPos } : t
    );
    setTerminals(updatedTerminals);

    // 2. Save new position to DB
    await fetch("/api/admin/save", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draggedTerminal.id, lat: newDragPos.lat, lng: newDragPos.lng }),
    });

    // 3. Auto-fetch new road paths for all connected routes
    const connectedRoutes = variants.filter(v => v.terminalIds.includes(draggedTerminal.id));
    for (const route of connectedRoutes) {
      const startT = updatedTerminals.find(t => t.id === route.terminalIds[0]);
      const endT = updatedTerminals.find(t => t.id === route.terminalIds[1]);
      
      if (startT && endT) {
        const newGeometry = await fetchRoadPathFromOSRM(startT, endT);
        if (newGeometry) {
          // Save the new geometry back to the database
          await fetch("/api/admin/save", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: route.id, geometry: newGeometry }),
          });
        }
      }
    }

    setSaving(false);
    setDraggedTerminal(null);
    setNewDragPos(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!selectedTerminal) return;
    if (!confirm(`Delete ${selectedTerminal.name}?`)) return;
    setSaving(true);
    const res = await fetch("/api/admin/save", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedTerminal.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to delete.");
      setSaving(false);
      return;
    }
    setSaving(false);
    resetForm();
    router.refresh();
  }

  const getTerminalNumber = (terminalId: string) => {
    if (!selectedTerminal) return 0;
    if (terminalId === selectedTerminal.id) return 1;
    const connectedArray = Array.from(connectedTerminalIds);
    return connectedArray.indexOf(terminalId) + 1;
  };

  return (
    <div className="relative w-full h-full flex">
      <div className="flex-1 relative">
        
        {draggedTerminal && newDragPos && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <span className="text-sm font-medium">Move "{draggedTerminal.name}"?</span>
            <div className="flex gap-2">
              <button onClick={handleConfirmMove} disabled={saving} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm font-medium disabled:opacity-50">
                {saving ? "Updating paths..." : "Save"}
              </button>
              <button onClick={() => { setDraggedTerminal(null); setNewDragPos(null); router.refresh(); }} disabled={saving} className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}

        {editingRoute && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <div>
              <p className="text-sm font-medium">Adjusting {editingRoute.routeName}</p>
              <p className="text-xs">Drag the orange line to change the road.</p>
            </div>
            <button onClick={handleSaveEditedRoute} disabled={saving} className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium disabled:opacity-50">
              {saving ? "Saving..." : "Save Path"}
            </button>
            <button onClick={cancelEditing} className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-medium">Cancel</button>
          </div>
        )}

        <MapGL
          ref={mapRef}
          initialViewState={{ longitude: 121.325, latitude: 14.067, zoom: 11 }}
          mapStyle={MAP_STYLE}
          onLoad={onMapLoad}
          onClick={(e) => {
            if (mode === "add-terminal") setSelectedPos({ lat: e.lngLat.lat, lng: e.lngLat.lng });
            else if (mode === "idle" && !draggedTerminal) {
              setSelectedTerminal(null);
              setFocusedRoute(null);
            }
          }}
        >
          {!editingRoute && !autoPath && variants.map((v) => {
            const isSelected = selectedRoutes.some((sr) => sr.id === v.id);
            if (isSelected) return null;

            if (v.geometry) {
              return (
                <Source key={`bg-${v.id}`} id={`bg-route-${v.id}`} type="geojson" data={v.geometry}>
                  <Layer id={`bg-route-layer-${v.id}`} type="line" paint={{ "line-color": "#9ca3af", "line-width": 2, "line-opacity": 0.2 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                </Source>
              );
            }
            return null;
          })}

          {!editingRoute && !autoPath && selectedRoutes.map((v) => {
            let geometryToDraw = v.geometry;

            if (draggedTerminal && newDragPos) {
              const isStartDragged = v.terminalIds[0] === draggedTerminal.id;
              const isEndDragged = v.terminalIds[1] === draggedTerminal.id;

              if (isStartDragged || isEndDragged) {
                const startT = terminals.find(t => t.id === v.terminalIds[0]);
                const endT = terminals.find(t => t.id === v.terminalIds[1]);
                
                if (startT && endT) {
                  const startLng = isStartDragged ? newDragPos.lng : startT.longitude;
                  const startLat = isStartDragged ? newDragPos.lat : startT.latitude;
                  const endLng = isEndDragged ? newDragPos.lng : endT.longitude;
                  const endLat = isEndDragged ? newDragPos.lat : endT.latitude;

                  geometryToDraw = {
                    type: "Feature",
                    properties: {},
                    geometry: {
                      type: "LineString",
                      coordinates: [[startLng, startLat], [endLng, endLat]]
                    }
                  };
                }
              }
            }

            if (!geometryToDraw && v.stops.length >= 2) {
              geometryToDraw = {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: v.stops.map(s => [s.longitude, s.latitude])
                }
              };
            }

            if (geometryToDraw) {
              const isFocused = focusedRoute?.id === v.id;
              const isDimmed = focusedRoute !== null && !isFocused;
              const isSelectedForEdit = editingRoute?.id === v.id;

              let lineColor = "#2563eb"; 
              let lineWidth = 5;

              if (isSelectedForEdit) {
                lineColor = "#f59e0b"; 
                lineWidth = 6;
              } else if (isFocused) {
                lineColor = "#f59e0b"; 
                lineWidth = 6;
              } else if (isDimmed) {
                lineColor = "#9ca3af"; 
                lineWidth = 3;
              }

              return (
                <Source key={`sel-${v.id}`} id={`sel-route-${v.id}`} type="geojson" data={geometryToDraw}>
                  <Layer 
                    id={`sel-route-layer-${v.id}`} 
                    type="line" 
                    paint={{ "line-color": lineColor, "line-width": lineWidth, "line-opacity": 1 }} 
                    layout={{ "line-cap": "round", "line-join": "round" }} 
                  />
                </Source>
              );
            }
            return null;
          })}

          {autoPath && (
            <Source id="preview-route" type="geojson" data={{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: autoPath } }}>
              <Layer id="preview-route-layer" type="line" paint={{ "line-color": "#3b82f6", "line-width": 5, "line-opacity": 0.8, "line-dasharray": [2, 1] }} layout={{ "line-cap": "round", "line-join": "round" }} />
            </Source>
          )}

          {terminals.map((t) => {
            const isConnected = connectedTerminalIds.has(t.id);
            const nodeNumber = isConnected ? getTerminalNumber(t.id) : 0;
            const isSelected = selectedTerminal?.id === t.id;
            const isStart = routeStart?.id === t.id;
            const isEnd = routeEnd?.id === t.id;

            let sizeClass = "w-6 h-6 text-xs";
            let bgColor = "bg-blue-600";
            let displayContent = "📍";

            if (selectedTerminal) {
              if (isConnected) {
                displayContent = nodeNumber.toString();
                if (isStart) {
                  bgColor = "bg-green-500";
                  sizeClass = "w-7 h-7 text-sm";
                } else if (isEnd) {
                  bgColor = "bg-red-500";
                  sizeClass = "w-7 h-7 text-sm";
                } else if (isSelected) {
                  bgColor = "bg-blue-800";
                  sizeClass = "w-7 h-7 text-sm";
                } else {
                  bgColor = "bg-blue-600";
                  sizeClass = "w-6 h-6 text-xs";
                }
              } else {
                displayContent = "";
                bgColor = "bg-gray-400 opacity-40";
                sizeClass = "w-2 h-2";
              }
            } else if (isStart) {
              displayContent = "1";
              bgColor = "bg-green-500";
            } else if (isEnd) {
              displayContent = "2";
              bgColor = "bg-red-500";
            } else if (isSelected) {
              bgColor = "bg-blue-800";
              sizeClass = "w-7 h-7 text-sm";
            }

            return (
              <Marker
                key={t.id}
                longitude={draggedTerminal?.id === t.id && newDragPos ? newDragPos.lng : t.longitude}
                latitude={draggedTerminal?.id === t.id && newDragPos ? newDragPos.lat : t.latitude}
                anchor="center"
                draggable={mode === "idle" && !editingRoute}
                onDragStart={() => setDraggedTerminal(t)}
                onDragEnd={(e) => setNewDragPos({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  if (mode === "idle" && !editingRoute) {
                    setSelectedTerminal(t);
                    setFocusedRoute(null);
                    mapRef.current?.flyTo({ center: [t.longitude, t.latitude], zoom: 13 });
                  } else if (mode === "add-route") {
                    if (!routeStart) {
                      setRouteStart(t);
                    } else if (routeStart.id !== t.id && !routeEnd) {
                      setRouteEnd(t);
                      generateRouteDetails(routeStart, t);
                      fetchRoadPath(routeStart, t);
                    }
                  }
                }}
              >
                <div
                  className={`flex items-center justify-center rounded-full text-white font-bold border-2 border-white shadow-md cursor-pointer transition-all hover:scale-110 ${bgColor} ${sizeClass}`}
                  title={t.name}
                >
                  {displayContent}
                </div>
              </Marker>
            );
          })}

          {selectedPos && mode === "add-terminal" && (
            <Marker longitude={selectedPos.lng} latitude={selectedPos.lat} anchor="bottom">
              <div className="text-3xl drop-shadow-md animate-bounce text-blue-600">📌</div>
            </Marker>
          )}
        </MapGL>

        {mode === "idle" && selectedTerminal && !editingRoute && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[min(90vw,500px)] bg-[var(--gw-bg1)] rounded-2xl shadow-2xl border border-[var(--gw-border)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--gw-border)] bg-[var(--gw-bg2)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--gw-text)]">
                  {focusedRoute ? `Route: ${focusedRoute.routeCode}` : selectedTerminal.name}
                </h2>
                <p className="text-xs text-[var(--gw-sub)]">
                  {focusedRoute ? focusedRoute.routeName : `${selectedTerminal.latitude.toFixed(5)}, ${selectedTerminal.longitude.toFixed(5)}`}
                </p>
              </div>
              <button 
                onClick={() => { setSelectedTerminal(null); setFocusedRoute(null); }} 
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 max-h-[40vh] overflow-y-auto">
              {focusedRoute ? (
                <div>
                  <h3 className="text-xs font-semibold text-[var(--gw-muted)] uppercase tracking-wider mb-3">
                    Stops in order
                  </h3>
                  <ol className="space-y-3">
                    {focusedRoute.stops.map((s) => (
                      <li key={s.id} className="flex gap-3 text-sm">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                          {s.sequence}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium text-[var(--gw-text)]">{s.name}</span>
                          {s.landmark && <span className="text-xs text-[var(--gw-sub)]">{s.landmark}</span>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div>
                  <h3 className="text-xs font-semibold text-[var(--gw-muted)] uppercase tracking-wider mb-3">
                    Connected Routes ({selectedRoutes.length})
                  </h3>
                  
                  {selectedRoutes.length === 0 ? (
                    <p className="text-sm text-gray-500 italic mb-4">No routes connected yet.</p>
                  ) : (
                    <ul className="space-y-2 mb-4">
                      {selectedRoutes.map((v) => (
                        <li 
                          key={v.id} 
                          onClick={() => setFocusedRoute(v)}
                          className="flex items-center justify-between p-3 border border-[var(--gw-border)] rounded-lg bg-[var(--gw-bg2)] cursor-pointer hover:bg-[var(--gw-bg3)] transition-colors"
                        >
                          <div>
                            <p className="font-mono text-sm font-bold text-[var(--gw-fern-text)]">{v.routeCode}</p>
                            <p className="text-sm text-[var(--gw-text)]">{v.routeName}</p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); startEditingRoute(v); }} 
                            className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100"
                          >
                            Adjust Path
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-[var(--gw-border)] bg-[var(--gw-bg2)] flex gap-3">
              {focusedRoute ? (
                <>
                  <button 
                    onClick={() => startEditingRoute(focusedRoute)} 
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Adjust Path
                  </button>
                  <button 
                    onClick={() => setFocusedRoute(null)} 
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium"
                  >
                    Back to Routes
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { setRouteStart(selectedTerminal); setMode("add-route"); }} 
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    + Add Route from here
                  </button>
                  <button 
                    onClick={handleDelete} 
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-80 bg-[var(--gw-bg1)] border-l border-[var(--gw-border)] p-4 overflow-y-auto">
        <h3 className="font-bold text-sm mb-4 text-[var(--gw-text)]">All Terminals ({terminals.length})</h3>
        <ul className="space-y-2">
          {terminals.map((t) => {
            const isConnected = connectedTerminalIds.has(t.id);
            const nodeNumber = isConnected ? getTerminalNumber(t.id) : 0;
            return (
              <li 
                key={t.id} 
                onClick={() => { setSelectedTerminal(t); setFocusedRoute(null); mapRef.current?.flyTo({ center: [t.longitude, t.latitude], zoom: 13 }); }} 
                className={`p-3 border rounded-lg text-sm cursor-pointer transition-colors flex items-center gap-3 ${selectedTerminal?.id === t.id ? "border-blue-500 bg-blue-50" : "border-[var(--gw-border)] bg-[var(--gw-bg2)] hover:bg-[var(--gw-bg3)]"}`}
              >
                {isConnected ? (
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shrink-0 ${t.id === selectedTerminal?.id ? "bg-blue-800" : "bg-blue-600"}`}>{nodeNumber}</div>
                ) : (
                  <div className="w-6 h-6 flex items-center justify-center text-gray-400 shrink-0 text-xs">—</div>
                )}
                <strong className="block text-[var(--gw-text)]">{t.name}</strong>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}