"use client";

import ProductMockupPreview from "./components/ProductMockupPreview";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { QrCode, Save, ArrowLeft, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type ElementType =
  | "text"
  | "image"
  | "qrcode"
  | "product-name"
  | "product-desc"
  | "ingredients"
  | "warnings";

type CanvasElement = {
  id: string;
  type: ElementType;
  content: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SCALE = 3; // 1mm = 3px on canvas
const DRAG_THRESHOLD = 5; // px before a click becomes a drag

// ─── Resize handle definitions ────────────────────────────────────────────────

const RESIZE_HANDLES = [
  { name: "nw", style: { top: -4, left: -4, cursor: "nwse-resize" } },
  {
    name: "n",
    style: { top: -4, left: "50%", cursor: "ns-resize", marginLeft: -4 },
  },
  { name: "ne", style: { top: -4, right: -4, cursor: "nesw-resize" } },
  {
    name: "e",
    style: { top: "50%", right: -4, cursor: "ew-resize", marginTop: -4 },
  },
  { name: "se", style: { bottom: -4, right: -4, cursor: "nwse-resize" } },
  {
    name: "s",
    style: { bottom: -4, left: "50%", cursor: "ns-resize", marginLeft: -4 },
  },
  { name: "sw", style: { bottom: -4, left: -4, cursor: "nesw-resize" } },
  {
    name: "w",
    style: { top: "50%", left: -4, cursor: "ew-resize", marginTop: -4 },
  },
] as const;

const PAPER_PRESETS = [
  { n: "A4", w: 210, h: 297 },
  { n: "A5", w: 148, h: 210 },
  { n: "Letter", w: 216, h: 279 },
  { n: "Legal", w: 216, h: 356 },
  { n: "A3", w: 297, h: 420 },
];

const ELEMENT_BUTTONS: { type: ElementType; icon: string; label: string }[] = [
  { type: "product-name", icon: "🏷️", label: "Product Name" },
  { type: "product-desc", icon: "📝", label: "Description" },
  { type: "ingredients", icon: "🧪", label: "Ingredients" },
  { type: "warnings", icon: "⚠️", label: "Warnings" },
  { type: "text", icon: "Aa", label: "Custom Text" },
  { type: "qrcode", icon: "⊞", label: "QR Code" },
  { type: "image", icon: "🖼️", label: "Image/Logo" },
];

const ELEMENT_LABEL: Record<ElementType, string> = {
  text: "Custom Text",
  image: "Image",
  qrcode: "QR Code",
  "product-name": "Product Name",
  "product-desc": "Description",
  ingredients: "Ingredients",
  warnings: "Warnings",
};

const ELEMENT_ICON: Record<ElementType, string> = {
  "product-name": "🏷️",
  "product-desc": "📝",
  ingredients: "🧪",
  warnings: "⚠️",
  qrcode: "⊞",
  image: "🖼️",
  text: "Aa",
};

const TEXT_ELEMENT_TYPES: ElementType[] = [
  "text",
  "product-name",
  "product-desc",
  "ingredients",
  "warnings",
];

// ─── Interaction state stored in a ref (never triggers re-renders) ────────────

type InteractMode = "idle" | "pending" | "dragging" | "resizing";

type InteractState = {
  mode: InteractMode;
  startX: number;
  startY: number;
  elId: string | null;
  elSnap: { x: number; y: number; w: number; h: number };
  handle: string;
};

// ─── Paper resize state ───────────────────────────────────────────────────────

type PaperDragType = "right" | "bottom" | "corner";

type PaperDragState = {
  active: boolean;
  type: PaperDragType | null;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewTemplatePage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [templateName, setTemplateName] = useState("New Template");
  const [paperWidth, setPaperWidth] = useState(210);
  const [paperHeight, setPaperHeight] = useState(297);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  // All drag/resize interaction lives here — no useState for these
  const interact = useRef<InteractState>({
    mode: "idle",
    startX: 0,
    startY: 0,
    elId: null,
    elSnap: { x: 0, y: 0, w: 0, h: 0 },
    handle: "",
  });
  const paperDrag = useRef<PaperDragState>({
    active: false,
    type: null,
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
  });
  // Keep a stable ref to elements so event handlers don't close over stale state
  const elementsRef = useRef(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const canvasWidth = paperWidth * SCALE;
  const canvasHeight = paperHeight * SCALE;

  // ── Auto-fit canvas to viewport ──────────────────────────────────────────

  useEffect(() => {
    function fit() {
      if (!containerRef.current) return;
      const cw = containerRef.current.clientWidth - 64;
      const ch = containerRef.current.clientHeight - 80;
      setCanvasScale(Math.min(cw / canvasWidth, ch / canvasHeight, 1));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [canvasWidth, canvasHeight]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const updateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      );
    },
    [],
  );

  function deleteElement(id: string) {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedId(null);
  }

  function addElement(type: ElementType) {
    const seed = ((Date.now() % 1000) + elements.length * 137) / 1000;
    const el: CanvasElement = {
      id: crypto.randomUUID(),
      type,
      content: ELEMENT_LABEL[type],
      x: Math.floor((seed % 1) * Math.max(1, paperWidth - 30)),
      y: Math.floor(((seed * 1.7) % 1) * Math.max(1, paperHeight - 10)),
      w: type === "qrcode" ? 15 : 30,
      h: type === "qrcode" ? 15 : 8,
      fontSize: type === "product-name" ? 16 : 11,
      color: "#1a1a1a",
      bold: type === "product-name",
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  }

  // ── Paper resize (still uses window listeners — paper isn't an element) ──

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const pd = paperDrag.current;
      if (!pd.active || !pd.type) return;

      const dx = e.clientX - pd.startX;
      const dy = e.clientY - pd.startY;

      if (pd.type === "right" || pd.type === "corner")
        setPaperWidth(
          Math.max(10, Math.round(pd.startW + dx / (SCALE * canvasScale))),
        );
      if (pd.type === "bottom" || pd.type === "corner")
        setPaperHeight(
          Math.max(10, Math.round(pd.startH + dy / (SCALE * canvasScale))),
        );
    }

    function onMouseUp() {
      paperDrag.current.active = false;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [canvasScale]);

  function startPaperDrag(type: PaperDragType, e: React.MouseEvent) {
    e.preventDefault();
    paperDrag.current = {
      active: true,
      type,
      startX: e.clientX,
      startY: e.clientY,
      startW: paperWidth,
      startH: paperHeight,
    };
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  async function saveTemplate() {
    setSaving(true);
    const res = await api.post("/api/templates", {
      name: templateName,
      width: paperWidth,
      height: paperHeight,
      margin: 3,
      layout: { elements },
    });
    setSaving(false);
    if (res.success) router.push("/templates");
    else alert("Failed to save");
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const selected = elements.find((el) => el.id === selectedId) ?? null;

  // ── Element interaction handlers (pointer-capture pattern) ────────────────
  //
  //   pointerdown  → mode = "pending", record start pos
  //   pointermove  → if moved > DRAG_THRESHOLD → mode = "dragging", update pos
  //   pointerup    → if still "pending" (no meaningful move) → SELECT the element
  //                  otherwise → end drag, mode = "idle"
  //
  //   setPointerCapture keeps events flowing to this element even if the
  //   pointer leaves it, replacing the global window mousemove approach.

  function onElementPointerDown(e: React.PointerEvent, el: CanvasElement) {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    interact.current = {
      mode: "pending",
      startX: e.clientX,
      startY: e.clientY,
      elId: el.id,
      elSnap: { x: el.x, y: el.y, w: el.w, h: el.h },
      handle: "",
    };
  }

  function onElementPointerMove(e: React.PointerEvent, el: CanvasElement) {
    const r = interact.current;
    if (r.elId !== el.id) return;
    if (r.mode !== "pending" && r.mode !== "dragging") return;

    const dx = e.clientX - r.startX;
    const dy = e.clientY - r.startY;

    // Commit to drag only once we exceed the threshold
    if (r.mode === "pending" && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    r.mode = "dragging";

    // Set grabbing cursor on body for the duration of the drag
    document.body.style.cursor = "grabbing";

    updateElement(el.id, {
      x: Math.max(
        0,
        Math.min(
          paperWidth - r.elSnap.w,
          r.elSnap.x + dx / (SCALE * canvasScale),
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          paperHeight - r.elSnap.h,
          r.elSnap.y + dy / (SCALE * canvasScale),
        ),
      ),
    });
  }

  function onElementPointerUp(e: React.PointerEvent, el: CanvasElement) {
    const r = interact.current;
    if (r.elId !== el.id) return;

    if (r.mode === "pending") {
      // No meaningful movement → treat as a click → select
      setSelectedId(el.id);
    }

    r.mode = "idle";
    r.elId = null;
    document.body.style.cursor = "";
  }

  // ── Resize handle handlers ────────────────────────────────────────────────

  function onHandlePointerDown(
    e: React.PointerEvent,
    elId: string,
    handle: string,
  ) {
    e.stopPropagation(); // ← never reaches the element's onPointerDown
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const el = elementsRef.current.find((el) => el.id === elId);
    if (!el) return;

    interact.current = {
      mode: "resizing",
      startX: e.clientX,
      startY: e.clientY,
      elId,
      elSnap: { x: el.x, y: el.y, w: el.w, h: el.h },
      handle,
    };
  }

  function onHandlePointerMove(e: React.PointerEvent, elId: string) {
    const r = interact.current;
    if (r.mode !== "resizing" || r.elId !== elId) return;

    const dx = (e.clientX - r.startX) / (SCALE * canvasScale);
    const dy = (e.clientY - r.startY) / (SCALE * canvasScale);
    const { handle: h, elSnap: s } = r;

    const updates: Partial<CanvasElement> = {};
    if (h.includes("e")) {
      updates.w = Math.max(1, s.w + dx);
    }
    if (h.includes("w")) {
      updates.x = Math.max(0, s.x + dx);
      updates.w = Math.max(1, s.w - dx);
    }
    if (h.includes("s")) {
      updates.h = Math.max(1, s.h + dy);
    }
    if (h.includes("n")) {
      updates.y = Math.max(0, s.y + dy);
      updates.h = Math.max(1, s.h - dy);
    }

    if (Object.keys(updates).length) updateElement(elId, updates);
  }

  function onHandlePointerUp() {
    interact.current.mode = "idle";
    interact.current.elId = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-0">
      {/* ── Left Panel ──────────────────────────────────────────────────── */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
        <Link
          href="/templates"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <h2 className="font-semibold text-gray-900">New Template</h2>

        {/* Name */}
        <div>
          <label className="text-xs font-medium text-gray-500">Name</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Paper presets */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">
            Paper Size
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PAPER_PRESETS.map((p) => (
              <button
                key={p.n}
                onClick={() => {
                  setPaperWidth(p.w);
                  setPaperHeight(p.h);
                }}
                className={`px-2 py-1.5 text-[11px] rounded border transition ${
                  paperWidth === p.w && paperHeight === p.h
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                {p.n}
                <br />
                <span className="text-[9px] opacity-60">
                  {p.w}×{p.h}mm
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom size */}
        <div className="border-t border-gray-100 pt-3">
          <label className="text-xs font-medium text-gray-500 mb-2 block">
            Custom Size (mm)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={paperWidth}
              onChange={(e) =>
                setPaperWidth(Math.max(10, parseInt(e.target.value) || 10))
              }
              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs text-center"
            />
            <span className="text-gray-400 text-xs">×</span>
            <input
              type="number"
              value={paperHeight}
              onChange={(e) =>
                setPaperHeight(Math.max(10, parseInt(e.target.value) || 10))
              }
              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs text-center"
            />
            <span className="text-gray-400 text-[10px]">mm</span>
          </div>
        </div>

        {/* Add elements */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">
            Add Elements
          </label>
          <div className="space-y-1">
            {ELEMENT_BUTTONS.map((item) => (
              <button
                key={item.type}
                onClick={() => addElement(item.type)}
                className="w-full text-left px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-xs font-medium transition"
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Element list */}
        {elements.length > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <label className="text-xs font-medium text-gray-500 mb-2 block">
              Elements on Canvas ({elements.length})
            </label>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {elements.map((el) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition ${
                    selectedId === el.id
                      ? "bg-indigo-50 text-indigo-700 font-medium border border-indigo-200"
                      : "hover:bg-gray-50 text-gray-600 border border-transparent"
                  }`}
                >
                  <GripVertical size={10} className="text-gray-300 shrink-0" />
                  <span className="text-[10px] w-4 text-center shrink-0">
                    {ELEMENT_ICON[el.type]}
                  </span>
                  <span className="truncate flex-1">{el.content}</span>
                  <span className="text-[9px] text-gray-400 shrink-0">
                    {Math.round(el.w)}×{Math.round(el.h)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(el.id);
                    }}
                    className="text-gray-300 hover:text-red-500 shrink-0"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Properties panel */}
        {selected && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Properties
            </h3>

            {/* Position & size */}
            <div className="grid grid-cols-2 gap-2">
              {(["x", "y", "w", "h"] as const).map((key) => (
                <div key={key}>
                  <label className="text-[10px] text-gray-400">
                    {
                      {
                        x: "X (mm)",
                        y: "Y (mm)",
                        w: "Width (mm)",
                        h: "Height (mm)",
                      }[key]
                    }
                  </label>
                  <input
                    type="number"
                    value={Math.round(selected[key] * 10) / 10}
                    onChange={(e) =>
                      updateElement(selected.id, {
                        [key]: Math.max(1, parseFloat(e.target.value) || 1),
                      })
                    }
                    className="w-full mt-0.5 px-2 py-1 border border-gray-300 rounded text-xs"
                    step="0.5"
                    min="1"
                  />
                </div>
              ))}
            </div>

            {/* Text options */}
            {TEXT_ELEMENT_TYPES.includes(selected.type) && (
              <>
                <div>
                  <label className="text-[10px] text-gray-400">
                    Font Size (pt)
                  </label>
                  <input
                    type="number"
                    value={selected.fontSize || 12}
                    onChange={(e) =>
                      updateElement(selected.id, {
                        fontSize: parseFloat(e.target.value) || 1,
                      })
                    }
                    className="w-full mt-0.5 px-2 py-1 border border-gray-300 rounded text-xs"
                    min={1}
                    max={72}
                    step="0.5"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selected.color || "#1a1a1a"}
                    onChange={(e) =>
                      updateElement(selected.id, { color: e.target.value })
                    }
                    className="flex-1 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <label className="flex items-center gap-1.5 px-2 py-1.5 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selected.bold || false}
                      onChange={(e) =>
                        updateElement(selected.id, { bold: e.target.checked })
                      }
                    />
                    <span className="text-[10px] font-bold">B</span>
                  </label>
                </div>

                {selected.type === "text" && (
                  <div>
                    <label className="text-[10px] text-gray-400">Content</label>
                    <input
                      type="text"
                      value={selected.content}
                      onChange={(e) =>
                        updateElement(selected.id, { content: e.target.value })
                      }
                      className="w-full mt-0.5 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => deleteElement(selected.id)}
              className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100 transition"
            >
              <Trash2 size={12} /> Remove Element
            </button>
          </div>
        )}

        {/* Preview */}
        <button
          onClick={() => setShowPreview(true)}
          disabled={elements.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
        >
          Preview on product
        </button>

        {/* Save */}
        <button
          onClick={saveTemplate}
          disabled={saving || elements.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition mt-auto"
        >
          <Save size={16} />
          {saving ? "Saving…" : "Save Template"}
        </button>
      </div>

      {/* ── Canvas area ─────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 bg-gray-100 p-8 overflow-auto flex items-center justify-center"
        // Click on the background deselects
        onClick={() => setSelectedId(null)}
      >
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="text-sm font-medium text-gray-700">Canvas</span>
            <span className="text-xs text-gray-400">
              {paperWidth} × {paperHeight} mm
            </span>
            <span className="text-xs text-gray-300">
              ({Math.round(canvasScale * 100)}%)
            </span>
          </div>

          <div className="relative inline-block">
            {/* Paper */}
            <div
              className="bg-white shadow-xl mx-auto relative select-none"
              style={{
                width: canvasWidth * canvasScale,
                height: canvasHeight * canvasScale,
              }}
            >
              {/* 1mm grid */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                  backgroundSize: `${SCALE * canvasScale}px ${SCALE * canvasScale}px`,
                }}
              />

              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm pointer-events-none">
                  Add elements from the left panel
                </div>
              )}

              {/* ── Elements ────────────────────────────────────────────── */}
              {elements.map((el) => {
                const isSelected = selectedId === el.id;

                return (
                  <div
                    key={el.id}
                    // ── Pointer-capture interaction ──────────────────────
                    onPointerDown={(e) => onElementPointerDown(e, el)}
                    onPointerMove={(e) => onElementPointerMove(e, el)}
                    onPointerUp={(e) => onElementPointerUp(e, el)}
                    // ── Stop canvas click-to-deselect firing on element ──
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute rounded-sm overflow-visible border-2 group touch-none ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/30"
                        : "border-transparent hover:border-indigo-200"
                    }`}
                    style={{
                      left: el.x * SCALE * canvasScale,
                      top: el.y * SCALE * canvasScale,
                      width: el.w * SCALE * canvasScale,
                      height: el.h * SCALE * canvasScale,
                      cursor: "grab",
                    }}
                  >
                    {/* ── Content ─────────────────────────────────────── */}
                    {el.type === "qrcode" ? (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <QrCode
                          size={Math.max(
                            2,
                            Math.min(el.w, el.h) * SCALE * canvasScale * 0.8,
                          )}
                          className="text-white"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          fontSize: `${Math.min(el.fontSize || 11, el.h * 0.7) * canvasScale}px`,
                          color: el.color,
                          fontWeight: el.bold ? "bold" : "normal",
                          lineHeight: 1,
                          overflow: "hidden",
                        }}
                      >
                        <span className="text-center leading-none">
                          {el.content}
                        </span>
                      </div>
                    )}

                    {/* ── Resize handles (only when selected) ─────────── */}
                    {isSelected &&
                      RESIZE_HANDLES.map(({ name, style }) => (
                        <div
                          key={name}
                          onPointerDown={(e) =>
                            onHandlePointerDown(e, el.id, name)
                          }
                          onPointerMove={(e) => onHandlePointerMove(e, el.id)}
                          onPointerUp={onHandlePointerUp}
                          className="absolute w-2 h-2 bg-white border border-indigo-400 rounded-sm z-10"
                          style={style as React.CSSProperties}
                        />
                      ))}
                  </div>
                );
              })}
            </div>

            {/* ── Paper resize handles ─────────────────────────────────── */}
            <div
              className="absolute top-0 -right-2 w-4 h-full cursor-ew-resize flex items-center justify-center group"
              onMouseDown={(e) => startPaperDrag("right", e)}
            >
              <div className="w-1 h-8 bg-gray-300 group-hover:bg-indigo-400 rounded-full transition-colors" />
            </div>
            <div
              className="absolute -bottom-2 left-0 w-full h-4 cursor-ns-resize flex items-center justify-center group"
              onMouseDown={(e) => startPaperDrag("bottom", e)}
            >
              <div className="h-1 w-8 bg-gray-300 group-hover:bg-indigo-400 rounded-full transition-colors" />
            </div>
            <div
              className="absolute -bottom-2 -right-2 w-4 h-4 cursor-nwse-resize flex items-center justify-center group"
              onMouseDown={(e) => startPaperDrag("corner", e)}
            >
              <div className="w-2 h-2 bg-gray-300 group-hover:bg-indigo-400 rounded-sm transition-colors" />
            </div>
          </div>
        </div>
      </div>
      {/* ── Product mockup preview modal ────────────────────────────── */}
      {showPreview && (
        <ProductMockupPreview
          elements={elements}
          paperWidth={paperWidth}
          paperHeight={paperHeight}
          onClose={() => setShowPreview(false)}
        />
      )}

    </div> 
  );
}