// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/templates/new/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { api } from "@/lib/api/client";
import {
  Type,
  Image,
  QrCode,
  Save,
  ArrowLeft,
  Trash2,
  GripHorizontal,
  GripVertical,
} from "lucide-react";
import Link from "next/link";

type Element = {
  id: string;
  type:
    | "text"
    | "image"
    | "qrcode"
    | "product-name"
    | "product-desc"
    | "ingredients"
    | "warnings";
  content: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
};

const SCALE = 3; // 1mm = 3px

export default function NewTemplatePage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [templateName, setTemplateName] = useState("New Template");
  const [paperWidth, setPaperWidth] = useState(210); // mm
  const [paperHeight, setPaperHeight] = useState(297); // mm
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);

  // Dragging state
  const [dragging, setDragging] = useState<
    "right" | "bottom" | "corner" | null
  >(null);
  const dragStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const dragThreshold = 12; // px from edge to start dragging

  const canvasWidth = paperWidth * SCALE;
  const canvasHeight = paperHeight * SCALE;

  // Auto-fit canvas
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current) return;
      const cw = containerRef.current.clientWidth - 64;
      const ch = containerRef.current.clientHeight - 80;
      const sx = cw / canvasWidth;
      const sy = ch / canvasHeight;
      setCanvasScale(Math.min(sx, sy, 1));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasWidth, canvasHeight]);

  // Paper presets
  function applyPreset(mmW: number, mmH: number) {
    setPaperWidth(mmW);
    setPaperHeight(mmH);
  }

  // Drag resize handlers
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;

      const dx = (e.clientX - dragStartRef.current.x) / canvasScale;
      const dy = (e.clientY - dragStartRef.current.y) / canvasScale;

      if (dragging === "right" || dragging === "corner") {
        setPaperWidth(
          Math.max(30, Math.round(dragStartRef.current.w / SCALE + dx / SCALE)),
        );
      }
      if (dragging === "bottom" || dragging === "corner") {
        setPaperHeight(
          Math.max(30, Math.round(dragStartRef.current.h / SCALE + dy / SCALE)),
        );
      }
    },
    [dragging, canvasScale],
  );

  function handleMouseUp() {
    setDragging(null);
  }

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove]);

  function startDrag(type: "right" | "bottom" | "corner", e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(type);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: paperWidth * SCALE * canvasScale,
      h: paperHeight * SCALE * canvasScale,
    };
  }

  function addElement(type: Element["type"]) {
    const labels: Record<string, string> = {
      text: "Custom Text",
      image: "Image",
      qrcode: "QR Code",
      "product-name": "Product Name",
      "product-desc": "Description",
      ingredients: "Ingredients",
      warnings: "Warnings",
    };
    const el: Element = {
      id: crypto.randomUUID(),
      type,
      content: labels[type] || type,
      x: Math.floor(paperWidth * 0.1),
      y: elements.length * 10,
      w: type === "qrcode" ? 20 : 60,
      h: type === "qrcode" ? 20 : 10,
      fontSize: type === "product-name" ? 16 : 11,
      color: "#1a1a1a",
      bold: type === "product-name",
    };
    setElements([...elements, el]);
    setSelectedElement(el.id);
  }

  function updateElement(id: string, updates: Partial<Element>) {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    );
  }

  function deleteElement(id: string) {
    setElements(elements.filter((el) => el.id !== id));
    setSelectedElement(null);
  }

  async function saveTemplate() {
    setSaving(true);
    const res = await api.post("/api/templates", {
      name: templateName,
      width: paperWidth,
      height: paperHeight,
      margin: 3,
      layout: {
        elements: elements.map((el) => ({
          id: el.id,
          type: el.type,
          content: el.content,
          x: el.x,
          y: el.y,
          w: el.w,
          h: el.h,
          fontSize: el.fontSize,
          color: el.color,
          bold: el.bold,
        })),
      },
    });
    setSaving(false);
    if (res.success) router.push("/templates");
    else alert("Failed to save");
  }

  const selected = elements.find((el) => el.id === selectedElement);
  const gridLayout = elements.map((el) => ({
    i: el.id,
    x: el.x,
    y: el.y,
    w: el.w,
    h: el.h,
  }));

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-0">
      {/* Left Panel */}
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

        {/* Presets */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">
            Paper Size
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { n: "A4", w: 210, h: 297 },
              { n: "A5", w: 148, h: 210 },
              { n: "Letter", w: 216, h: 279 },
              { n: "Legal", w: 216, h: 356 },
              { n: "A3", w: 297, h: 420 },
            ].map((p) => (
              <button
                key={p.n}
                onClick={() => applyPreset(p.w, p.h)}
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
              value={paperWidth} // ← auto-updates when dragging
              onChange={(e) =>
                setPaperWidth(Math.max(30, parseInt(e.target.value) || 30))
              }
              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs text-center"
            />
            <span className="text-gray-400 text-xs">×</span>
            <input
              type="number"
              value={paperHeight} // ← auto-updates when dragging
              onChange={(e) =>
                setPaperHeight(Math.max(30, parseInt(e.target.value) || 30))
              }
              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs text-center"
            />
            <span className="text-gray-400 text-[10px]">mm</span>
          </div>
        </div>

        {/* Add Elements */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">
            Elements
          </label>
          <div className="space-y-1">
            {[
              {
                type: "product-name" as const,
                icon: "🏷️",
                label: "Product Name",
              },
              {
                type: "product-desc" as const,
                icon: "📝",
                label: "Description",
              },
              {
                type: "ingredients" as const,
                icon: "🧪",
                label: "Ingredients",
              },
              { type: "warnings" as const, icon: "⚠️", label: "Warnings" },
              { type: "text" as const, icon: "Aa", label: "Custom Text" },
              { type: "qrcode" as const, icon: "⊞", label: "QR Code" },
              { type: "image" as const, icon: "🖼️", label: "Image/Logo" },
            ].map((item) => (
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

        {/* Properties */}
        {selected && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase">
              Properties
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400">Width (mm)</label>
                <input
                  type="number"
                  value={selected.w}
                  onChange={(e) =>
                    updateElement(selected.id, {
                      w: Math.max(5, parseInt(e.target.value) || 5),
                    })
                  }
                  className="w-full mt-0.5 px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Height (mm)</label>
                <input
                  type="number"
                  value={selected.h}
                  onChange={(e) =>
                    updateElement(selected.id, {
                      h: Math.max(5, parseInt(e.target.value) || 5),
                    })
                  }
                  className="w-full mt-0.5 px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>
            {[
              "text",
              "product-name",
              "product-desc",
              "ingredients",
              "warnings",
            ].includes(selected.type) && (
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
                        fontSize: parseInt(e.target.value),
                      })
                    }
                    className="w-full mt-0.5 px-2 py-1 border border-gray-300 rounded text-xs"
                    min={4}
                    max={72}
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
              </>
            )}
            <button
              onClick={() => deleteElement(selected.id)}
              className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100"
            >
              <Trash2 size={12} /> Remove
            </button>
          </div>
        )}

        <button
          onClick={saveTemplate}
          disabled={saving || elements.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition mt-auto"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Template"}
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 bg-gray-100 p-8 overflow-auto flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="text-sm font-medium text-gray-700">Custom</span>
            <span className="text-xs text-gray-400">
              {paperWidth} × {paperHeight} mm
            </span>
            <span className="text-xs text-gray-300">
              ({Math.round(canvasScale * 100)}%)
            </span>
          </div>

          {/* Paper with drag handles */}
          <div className="relative inline-block">
            <div
              className="bg-white shadow-xl mx-auto relative"
              style={{
                width: canvasWidth * canvasScale,
                height: canvasHeight * canvasScale,
                transition: dragging ? "none" : "width 0.2s, height 0.2s",
                cursor: dragging
                  ? `${dragging === "corner" ? "nwse" : dragging === "right" ? "ew" : "ns"}-resize`
                  : "default",
              }}
            >
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                  backgroundSize: `${SCALE * canvasScale}px ${SCALE * canvasScale}px`,
                }}
              />

              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm pointer-events-none">
                  Add elements or drag edges to resize
                </div>
              )}

              <GridLayout
                layout={gridLayout}
                cols={paperWidth}
                rowHeight={SCALE * canvasScale}
                width={canvasWidth * canvasScale}
                onLayoutChange={(layout: any[]) =>
                  setElements((prev) =>
                    prev.map((el) => {
                      const l = layout.find((li: any) => li.i === el.id);
                      return l ? { ...el, x: l.x, y: l.y, w: l.w, h: l.h } : el;
                    }),
                  )
                }
                draggableHandle=".drag-handle"
                isResizable
                isDraggable
                margin={[0, 0]}
                compactType={null}
                preventCollision
                transformScale={canvasScale}
              >
                {elements.map((el) => (
                  <div
                    key={el.id}
                    className={`drag-handle border-2 rounded-sm cursor-move overflow-hidden ${
                      selectedElement === el.id
                        ? "border-indigo-500 bg-indigo-50/30"
                        : "border-transparent hover:border-indigo-300"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(el.id);
                    }}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center p-0.5 select-none"
                      style={{
                        fontSize: `${(el.fontSize || 11) * canvasScale}px`,
                        color: el.color,
                        fontWeight: el.bold ? "bold" : "normal",
                      }}
                    >
                      {el.type === "qrcode" ? (
                        <div className="w-full h-full bg-gray-900 rounded-sm flex items-center justify-center">
                          <QrCode
                            size={Math.max(8, 20 * canvasScale)}
                            className="text-white"
                          />
                        </div>
                      ) : (
                        <span className="text-center leading-tight">
                          {el.content}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </GridLayout>
            </div>

            {/* Drag handles */}
            {/* Right edge */}
            <div
              className="absolute top-0 -right-2 w-4 h-full cursor-ew-resize flex items-center justify-center group"
              onMouseDown={(e) => startDrag("right", e)}
            >
              <div className="w-1 h-8 bg-gray-300 group-hover:bg-indigo-400 rounded-full transition-colors" />
            </div>
            {/* Bottom edge */}
            <div
              className="absolute -bottom-2 left-0 w-full h-4 cursor-ns-resize flex items-center justify-center group"
              onMouseDown={(e) => startDrag("bottom", e)}
            >
              <div className="h-1 w-8 bg-gray-300 group-hover:bg-indigo-400 rounded-full transition-colors" />
            </div>
            {/* Corner */}
            <div
              className="absolute -bottom-2 -right-2 w-4 h-4 cursor-nwse-resize flex items-center justify-center group"
              onMouseDown={(e) => startDrag("corner", e)}
            >
              <div className="w-2 h-2 bg-gray-300 group-hover:bg-indigo-400 rounded-sm transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
