// src/app/(protected)/map/AdminMap.tsx

"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import MapGL, { Marker, Source, Layer } from "react-map-gl/maplibre";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";
import "maplibre-gl/dist/maplibre-gl.css";

// ─── MAP PRESETS ───
const MAP_STYLES = {
  Positron: "https://tiles.openfreemap.org/styles/positron",
  Bright: "https://tiles.openfreemap.org/styles/bright",
  Liberty: "https://tiles.openfreemap.org/styles/liberty",
  Dark: "https://tiles.openfreemap.org/styles/dark",
  Fiord: "https://tiles.openfreemap.org/styles/fiord",
  "3D": "https://tiles.openfreemap.org/styles/liberty", // Uses Liberty + 3D buildings
} as const;

type StyleKey = keyof typeof MAP_STYLES;

type Terminal = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  variantIds: string[];
};

type GeometrySegment = {
  type: "road" | "ferry";
  coordinates: [number, number][];
};

type Variant = {
  id: string;
  name: string;
  direction: string;
  geometry: GeometrySegment[] | any | null;
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

export default function AdminMap() {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const directionsRef = useRef<MapLibreGlDirections | null>(null);
  
  // Spatial Data State
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Map Style State
  const [styleKey, setStyleKey] = useState<StyleKey>("Positron");

  // UI State
  const [mode, setMode] = useState<"idle" | "add-terminal" | "add-route">("idle");
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [focusedRoute, setFocusedRoute] = useState<Variant | null>(null);

  const [draggedTerminal, setDraggedTerminal] = useState<Terminal | null>(null);
  const [newDragPos, setNewDragPos] = useState<{ lat: number; lng: number } | null>(null);
  
  const [routeStart, setRouteStart] = useState<Terminal | null>(null);
  const [routeEnd, setRouteEnd] = useState<Terminal | null>(null);
  const [autoPath, setAutoPath] = useState<[number, number][] | null>(null);
  const [editingRoute, setEditingRoute] = useState<Variant | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // --- SPATIAL FETCHING (Terminals only) ---
  const fetchVisibleTerminals = useCallback(async (bounds: any) => {
    if (!bounds) return;
    setLoadingMap(true);
    try {
      const res = await fetch(
        `/api/admin/terminals/bbox?minLng=${bounds.getWest()}&minLat=${bounds.getSouth()}&maxLng=${bounds.getEast()}&maxLat=${bounds.getNorth()}`
      );
      const data = await res.json();
      if (data.terminals) {
        setTerminals((prev) => {
          const terminalMap = new Map(prev.map((t) => [t.id, t]));
          data.terminals.forEach((t: Terminal) => terminalMap.set(t.id, t));
          return Array.from(terminalMap.values());
        });
      }
    } catch (err) {
      console.error("Failed to fetch terminals", err);
    } finally {
      setTimeout(() => setLoadingMap(false), 300);
    }
  }, []);

  const onMapLoad = () => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    
    fetchVisibleTerminals(map.getBounds());

    // Initialize 3D buildings if the style is 3D
    if (styleKey === "3D") {
      enable3DBuildings(map);
    }

    const directions = new MapLibreGlDirections(map, {
      api: "https://router.project-osrm.org/route/v1/driving/",
      profile: "driving",
      styles: [{ id: "directions-line", type: "line", paint: { "line-color": "#f59e0b", "line-width": 5 } }],
    });
    directions.interactive = false;
    directionsRef.current = directions;
  };

  // Helper to enable 3D buildings on Liberty style
  const enable3DBuildings = (map: any) => {
    if (!map.getLayer("building")) return;
    
    // Tilt the camera slightly to show the 3D effect
    map.easeTo({ pitch: 50, bearing: -20, duration: 1000 });

    // Add 3D extrusion to the building layer
    map.setPaintProperty("building", "fill-extrusion-color", "#d1d5db");
    map.setPaintProperty("building", "fill-extrusion-height", ["get", "render_height"]);
    map.setPaintProperty("building", "fill-extrusion-base", ["get", "render_min_height"]);
    map.setPaintProperty("building", "fill-extrusion-opacity", 0.6);
  };

  // Helper to reset 3D when switching back to 2D
  const reset3D = (map: any) => {
    map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
    if (map.getLayer("building")) {
      map.setPaintProperty("building", "fill-extrusion-height", null);
      map.setPaintProperty("building", "fill-extrusion-base", null);
      map.setPaintProperty("building", "fill-extrusion-opacity", null);
      map.setPaintProperty("building", "fill-extrusion-color", null);
    }
  };

  const onMoveEnd = (e: ViewStateChangeEvent) => {
    if (mode === "idle" && !draggedTerminal && !editingRoute) {
      fetchVisibleTerminals(e.target.getBounds());
    }
  };

  const handleTerminalClick = async (t: Terminal) => {
    if (mode !== "idle" || editingRoute) return;

    setSelectedTerminal(t);
    setFocusedRoute(null);
    mapRef.current?.flyTo({ center: [t.longitude, t.latitude], zoom: 13 });

    const alreadyLoaded = t.variantIds.every(id => variants.some(v => v.id === id));
    if (alreadyLoaded) return;

    setLoadingRoutes(true);
    try {
      const res = await fetch(`/api/admin/terminals/${t.id}/routes`);
      const data = await res.json();
      
      if (data.variants) {
        setVariants(prev => {
          const newIds = new Set(data.variants.map((v: any) => v.id));
          const oldFiltered = prev.filter(v => !newIds.has(v.id));
          return [...oldFiltered, ...data.variants];
        });
      }
    } catch (err) {
      console.error("Failed to load routes", err);
    } finally {
      setTimeout(() => setLoadingRoutes(false), 500);
    }
  };

  const selectedRoutes = useMemo(() => {
    if (!selectedTerminal || !variants) return [];
    return selectedTerminal.variantIds
      .map((id) => variants.find((v) => v.id === id))
      .filter((v): v is Variant => Boolean(v));
  }, [selectedTerminal, variants]);

  const connectedTerminalIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedTerminal) return ids;
    
    ids.add(selectedTerminal.id);
    selectedRoutes.forEach((route) => {
      if (route.terminalIds && Array.isArray(route.terminalIds)) {
        route.terminalIds.forEach((id) => ids.add(id));
      }
    });
    return ids;
  }, [selectedTerminal, selectedRoutes]);

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
    setAutoPath(null);
    setRouteError(null);
    const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
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
    }
  }

  async function handleDragEnd(t: Terminal, e: any) {
    setNewDragPos({ lat: e.lngLat.lat, lng: e.lngLat.lng });
  }

  function startEditingRoute(route: Variant) {
    if (!directionsRef.current) return;
    setEditingRoute(route);
    setFocusedRoute(null);
    directionsRef.current.clear();

    const geom = Array.isArray(route.geometry) ? route.geometry[0] : route.geometry;
    
    if (geom?.coordinates) {
      const coords = geom.coordinates;
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
    if (!routes || routes.length === 0) return;

    const newGeometry = routes[0].geometry;
    setSaving(true);
    await fetch("/api/admin/save", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingRoute.id, geometry: newGeometry }),
    });

    setSaving(false);
    resetForm();
    if (mapRef.current) {
      setVariants([]);
      fetchVisibleTerminals(mapRef.current.getMap().getBounds());
    }
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
    if (mapRef.current) {
      setVariants([]);
      fetchVisibleTerminals(mapRef.current.getMap().getBounds());
    }
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
    if (mapRef.current) {
      setTerminals([]);
      fetchVisibleTerminals(mapRef.current.getMap().getBounds());
    }
  }

  async function handleConfirmMove() {
    if (!draggedTerminal || !newDragPos) return;
    setSaving(true);

    await fetch("/api/admin/save", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draggedTerminal.id, lat: newDragPos.lat, lng: newDragPos.lng }),
    });
    
    setSaving(false);
    setDraggedTerminal(null);
    setNewDragPos(null);
    if (mapRef.current) {
      setVariants([]); 
      fetchVisibleTerminals(mapRef.current.getMap().getBounds());
    }
  }

  function handleCancelMove() {
    setDraggedTerminal(null);
    setNewDragPos(null);
    if (mapRef.current) {
      fetchVisibleTerminals(mapRef.current.getMap().getBounds());
    }
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
    if (mapRef.current) {
      setTerminals([]);
      setVariants([]);
      fetchVisibleTerminals(mapRef.current.getMap().getBounds());
    }
  }

  const getTerminalNumber = (terminalId: string) => {
    if (!selectedTerminal) return 0;
    if (terminalId === selectedTerminal.id) return 1;
    const connectedArray = Array.from(connectedTerminalIds);
    return connectedArray.indexOf(terminalId) + 1;
  };

  // --- RENDER HELPERS ---
  const renderRouteGeometry = (variant: Variant, isBackground: boolean, isFocused: boolean) => {
    if (!variant.geometry) return null;

    const isArray = Array.isArray(variant.geometry);
    const segments = isArray ? variant.geometry : [{ type: "road", coordinates: variant.geometry.coordinates }];

    return segments.map((seg: any, idx: number) => {
      const isFerry = seg.type === "ferry";
      
      let color = "#2563eb"; 
      let width = 5;
      let opacity = 1;
      let dashArray: number[] | undefined = undefined;

      // Adjust colors based on the map style (Dark styles need brighter lines)
      const isDark = styleKey === "Dark" || styleKey === "Fiord" || styleKey === "3D";

      if (isFerry) {
        color = isDark ? "#93c5fd" : "#60a5fa"; // Lighter blue for dark mode
        width = 4;
        dashArray = [2, 2]; 
      } else {
        color = isDark ? "#60a5fa" : "#2563eb"; // Brighter blue for dark mode
      }

      if (isBackground) {
        color = isFerry ? "#d1d5db" : "#9ca3af";
        width = 2;
        opacity = 0.2;
        dashArray = isFerry ? [2, 2] : undefined;
      } else if (isFocused) {
        color = isFerry ? "#fbbf24" : "#f59e0b"; 
        width = isFerry ? 4 : 6;
        dashArray = isFerry ? [2, 2] : undefined;
      } else if (focusedRoute !== null) {
        color = isFerry ? "#d1d5db" : "#9ca3af";
        width = isFerry ? 2 : 3;
        opacity = 0.5;
        dashArray = isFerry ? [2, 2] : undefined;
      }

      const paintOptions: any = {
        "line-color": color,
        "line-width": width,
        "line-opacity": opacity,
      };
      
      if (dashArray) {
        paintOptions["line-dasharray"] = dashArray;
      }

      return (
        <Source 
          key={`${variant.id}-${idx}`} 
          id={`route-${variant.id}-${idx}`} 
          type="geojson" 
          data={{ 
            type: "Feature", 
            properties: {}, 
            geometry: { 
              type: "LineString", 
              coordinates: seg.coordinates 
            } 
          }}
        >
          <Layer
            id={`route-layer-${variant.id}-${idx}`}
            type="line"
            paint={paintOptions}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
        </Source>
      );
    });
  };

  return (
    <div className="relative w-full h-full flex">
      <div className="flex-1 relative">
        
        {/* TOP RIGHT: STYLE SWITCHER & LOADING */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
          
          {/* Style Switcher */}
          <div className="bg-white/95 border border-gray-200 rounded-xl shadow-lg p-1 flex gap-1">
            {(Object.keys(MAP_STYLES) as StyleKey[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setStyleKey(key);
                  if (mapRef.current) {
                    const map = mapRef.current.getMap();
                    if (key === "3D") {
                      map.setStyle(MAP_STYLES[key]);
                      map.once('style.load', () => enable3DBuildings(map));
                    } else {
                      reset3D(map);
                      map.setStyle(MAP_STYLES[key]);
                    }
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  styleKey === key 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          <div 
            className={`bg-white/95 border border-gray-200 text-gray-800 px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-500 ${
              (loadingMap || loadingRoutes) ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">
              {loadingRoutes ? "Loading route paths..." : "Loading terminals..."}
            </span>
          </div>
        </div>

        {draggedTerminal && newDragPos && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <span className="text-sm font-medium">Move "{draggedTerminal.name}"?</span>
            <div className="flex gap-2">
              <button onClick={handleConfirmMove} disabled={saving} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm font-medium disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={handleCancelMove} disabled={saving} className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-medium">
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
            <button onClick={resetForm} className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-medium">Cancel</button>
          </div>
        )}

        <MapGL
          ref={mapRef}
          initialViewState={{ longitude: 121.325, latitude: 14.067, zoom: 11 }}
          mapStyle={MAP_STYLES[styleKey]}
          onLoad={onMapLoad}
          onMoveEnd={onMoveEnd}
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
            return renderRouteGeometry(v, true, false);
          })}

          {!editingRoute && !autoPath && selectedRoutes.map((v) => {
            const isFocused = focusedRoute?.id === v.id;
            if (isFocused) return null;
            return renderRouteGeometry(v, false, false);
          })}

          {!editingRoute && !autoPath && focusedRoute && renderRouteGeometry(focusedRoute, false, true)}

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

            if (mode === "add-route") {
              if (isStart) { displayContent = "1"; bgColor = "bg-green-500"; sizeClass = "w-8 h-8 text-sm"; }
              else if (isEnd) { displayContent = "2"; bgColor = "bg-red-500"; sizeClass = "w-8 h-8 text-sm"; }
            } else if (selectedTerminal) {
              if (isConnected) {
                displayContent = nodeNumber.toString();
                if (isSelected) { bgColor = "bg-blue-800"; sizeClass = "w-7 h-7 text-sm"; }
              } else {
                displayContent = ""; bgColor = "bg-gray-300 opacity-20"; sizeClass = "w-2 h-2";
              }
            }

            return (
              <Marker
                key={t.id}
                longitude={draggedTerminal?.id === t.id && newDragPos ? newDragPos.lng : t.longitude}
                latitude={draggedTerminal?.id === t.id && newDragPos ? newDragPos.lat : t.latitude}
                anchor="center"
                draggable={mode === "idle" && !editingRoute}
                onDragStart={() => setDraggedTerminal(t)}
                onDragEnd={(e) => handleDragEnd(t, e)}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  if (mode === "idle" && !editingRoute) {
                    handleTerminalClick(t);
                  } else if (mode === "add-route") {
                    if (!routeStart) setRouteStart(t);
                    else if (routeStart.id !== t.id && !routeEnd) {
                      setRouteEnd(t);
                      generateRouteDetails(routeStart, t);
                      fetchRoadPath(routeStart, t);
                    }
                  }
                }}
              >
                <div className={`flex items-center justify-center rounded-full text-white font-bold border-2 border-white shadow-md cursor-pointer transition-all hover:scale-110 ${bgColor} ${sizeClass}`} title={t.name}>
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
          <div className="absolute top-4 left-4 z-[1000] w-80 bg-[var(--gw-bg1)] rounded-xl shadow-xl border border-[var(--gw-border)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--gw-border)] bg-[var(--gw-bg2)]">
              <div className="min-w-0 pr-2">
                <h2 className="text-sm font-bold text-[var(--gw-text)] truncate">{selectedTerminal.name}</h2>
                <p className="text-[10px] text-[var(--gw-sub)] truncate">{selectedTerminal.latitude.toFixed(5)}, {selectedTerminal.longitude.toFixed(5)}</p>
              </div>
              <button onClick={() => { setSelectedTerminal(null); setFocusedRoute(null); }} className="text-gray-400 hover:text-gray-700 font-bold text-xs bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center shrink-0">✕</button>
            </div>
            <div className="p-3 max-h-[35vh] overflow-y-auto">
              <h3 className="text-[10px] font-semibold text-[var(--gw-muted)] uppercase tracking-wider mb-2">Connected Routes ({selectedRoutes.length})</h3>
              
              {loadingRoutes && (
                <p className="text-xs text-blue-500 mb-2">Loading routes...</p>
              )}

              {selectedRoutes.length === 0 && !loadingRoutes ? <p className="text-xs text-gray-500 italic mb-2">No routes connected.</p> : (
                <ul className="space-y-1.5 mb-2">
                  {selectedRoutes.map((v) => {
                    const isFocused = focusedRoute?.id === v.id;
                    return (
                      <li key={v.id} onClick={() => setFocusedRoute(isFocused ? null : v)} className={`flex flex-col p-2 border rounded cursor-pointer transition-colors group ${isFocused ? "border-orange-400 bg-orange-50" : "border-[var(--gw-border)] bg-[var(--gw-bg2)] hover:bg-[var(--gw-bg3)]"}`}>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="font-mono text-[10px] font-bold text-[var(--gw-fern-text)] leading-tight">{v.routeCode}</p>
                            <p className="text-xs text-[var(--gw-text)] truncate leading-tight">{v.routeName}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); startEditingRoute(v); }} className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 shrink-0">Edit</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="px-3 py-2 border-t border-[var(--gw-border)] bg-[var(--gw-bg2)] flex gap-2">
              <button onClick={() => { setRouteStart(selectedTerminal); setMode("add-route"); setSelectedTerminal(null); setFocusedRoute(null); }} className="flex-1 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">+ Add Route</button>
              <button onClick={handleDelete} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-medium hover:bg-red-100">Del</button>
            </div>
          </div>
        )}

        {mode === "add-route" && (
          <div className="absolute top-4 left-4 z-[1000] w-80 bg-[var(--gw-bg1)] p-4 rounded-xl shadow-xl border border-[var(--gw-border)]">
            <h2 className="font-bold text-sm mb-3 text-[var(--gw-text)]">Draw New Route</h2>
            {routeError && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">{routeError}</div>}
            <form onSubmit={handleSaveNewRoute} className="flex flex-col gap-3">
              <p className="text-xs text-[var(--gw-sub)]">
                {!routeStart ? "1. Click a start terminal (Green)." : !routeEnd ? "2. Click the end terminal (Red)." : "3. Save the route."}
              </p>
              {autoPath && <p className="text-xs text-green-600 font-bold">Path found!</p>}
              <input type="text" placeholder="Route Code" required value={code} onChange={(e) => setCode(e.target.value)} className="px-3 py-2 text-sm rounded border border-[var(--gw-border)] bg-[var(--gw-bg2)] text-[var(--gw-text)]" />
              <input type="text" placeholder="Route Name" required value={name} onChange={(e) => setName(e.target.value)} className="px-3 py-2 text-sm rounded border border-[var(--gw-border)] bg-[var(--gw-bg2)] text-[var(--gw-text)]" />
              <div className="flex gap-2">
                <button type="submit" disabled={saving || !routeStart || !routeEnd || !autoPath} className="flex-1 py-2 bg-blue-600 text-white rounded text-sm font-medium disabled:opacity-50">Save Route</button>
                <button type="button" onClick={resetForm} className="flex-1 py-2 bg-gray-200 text-gray-800 rounded text-sm font-medium">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="w-80 bg-[var(--gw-bg1)] border-l border-[var(--gw-border)] flex flex-col">
        <div className="p-4 border-b border-[var(--gw-border)]">
          <h3 className="font-bold text-sm text-[var(--gw-text)]">Loaded Terminals ({terminals.length})</h3>
          <p className="text-xs text-[var(--gw-sub)] mt-1">Pan or zoom the map to load more.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {terminals.map((t) => {
              const isConnected = connectedTerminalIds.has(t.id);
              const nodeNumber = isConnected ? getTerminalNumber(t.id) : 0;
              return (
                <li 
                  key={t.id} 
                  onClick={() => { handleTerminalClick(t); }} 
                  className={`p-3 border rounded-lg text-sm cursor-pointer transition-colors flex items-center gap-3 ${selectedTerminal?.id === t.id ? "border-blue-500 bg-blue-50" : "border-[var(--gw-border)] bg-[var(--gw-bg2)] hover:bg-[var(--gw-bg3)]"}`}
                >
                  {isConnected ? (
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shrink-0 ${t.id === selectedTerminal?.id ? "bg-blue-800" : "bg-blue-600"}`}>{nodeNumber}</div>
                  ) : (
                    <div className="w-6 h-6 flex items-center justify-center text-gray-400 shrink-0 text-xs">—</div>
                  )}
                  <strong className="block text-[var(--gw-text)] truncate">{t.name}</strong>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}