// 📁 src/app/(protected)/templates/new/components/ProductMockupPreview.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CanvasElement = {
  id: string;
  type: string;
  content: string;
  x: number; y: number; w: number; h: number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
};

type ContainerType = "bottle" | "can" | "pouch" | "jar" | "box" | "sachet";

type ProductMockupPreviewProps = {
  elements?: CanvasElement[];
  paperWidth: number;
  paperHeight: number;
  onClose: () => void;
};

// ─── Container defaults ───────────────────────────────────────────────────────

const CONTAINER_DEFAULTS: Record<ContainerType, { width: number; height: number; label: string }> = {
  bottle: { width: 70, height: 240, label: "Bottle" },
  can:    { width: 66, height: 170, label: "Can" },
  pouch:  { width: 140, height: 200, label: "Flat pouch" },
  jar:    { width: 80, height: 120, label: "Wide jar" },
  box:    { width: 80, height: 180, label: "Box" },
  sachet: { width: 160, height: 100, label: "Sachet" },
};

// ─── Color utils ──────────────────────────────────────────────────────────────

function shadeHex(hex: string, amt: number): string {
  const clamp = (n: number) => Math.min(255, Math.max(0, n));
  const r = clamp(parseInt(hex.slice(1, 3), 16) + amt);
  const g = clamp(parseInt(hex.slice(3, 5), 16) + amt);
  const b = clamp(parseInt(hex.slice(5, 7), 16) + amt);
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114;
}

// ─── SVG builder helpers ──────────────────────────────────────────────────────

type Attrs = Record<string, string | number>;

const NS = "http://www.w3.org/2000/svg";
function el<T extends SVGElement>(tag: string, attrs: Attrs = {}): T {
  const e = document.createElementNS(NS, tag) as T;
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}
const g    = (attrs: Attrs = {}) => el<SVGGElement>("g", attrs);
const rect = (attrs: Attrs)      => el<SVGRectElement>("rect", attrs);
const ell  = (attrs: Attrs)      => el<SVGEllipseElement>("ellipse", attrs);
const p    = (attrs: Attrs)      => el<SVGPathElement>("path", attrs);
const ln   = (attrs: Attrs)      => el<SVGLineElement>("line", attrs);
const poly = (attrs: Attrs)      => el<SVGPolygonElement>("polygon", attrs);
function txt(content: string, attrs: Attrs): SVGTextElement {
  const e = el<SVGTextElement>("text", attrs);
  e.textContent = content;
  return e;
}

// ─── Fit paper ratio into container's label slot ──────────────────────────────

function fitLabel(
  maxX: number,
  maxY: number,
  maxW: number,
  maxH: number,
  paperWidth: number,
  paperHeight: number,
): { x: number; y: number; w: number; h: number } {
  const paperRatio = paperWidth / paperHeight;
  const slotRatio  = maxW / maxH;

  let w: number, h: number;

  if (paperRatio > slotRatio) {
    w = maxW;
    h = maxW / paperRatio;
  } else {
    h = maxH;
    w = maxH * paperRatio;
  }

  const x = maxX + (maxW - w) / 2;
  const y = maxY + (maxH - h) / 2;

  return { x, y, w, h };
}

// ─── Label content renderer ───────────────────────────────────────────────────

function renderLabelElements(
  parent: SVGElement,
  elements: CanvasElement[],
  paperWidth: number,
  paperHeight: number,
  lblX: number,
  lblY: number,
  lblW: number,
  lblH: number,
  labelBg: string,
) {
  if (!elements || elements.length === 0) return;

  const scaleX = lblW / paperWidth;
  const scaleY = lblH / paperHeight;
  const tf     = luminance(labelBg) > 128 ? "#1a1a1a" : "#f0f0f0";

  for (const elem of elements) {
    const ex = lblX + elem.x * scaleX;
    const ey = lblY + elem.y * scaleY;
    const ew = elem.w * scaleX;
    const eh = elem.h * scaleY;

    if (elem.type === "qrcode") {
      parent.appendChild(rect({ x: ex, y: ey, width: ew, height: eh, fill: tf, opacity: 0.85, rx: 1 }));
      const cell = Math.min(ew, eh) / 4;
      for (let ci = 0; ci < 3; ci++) {
        for (let cj = 0; cj < 3; cj++) {
          if (ci === 1 && cj === 1) continue;
          parent.appendChild(rect({
            x: ex + 1 + ci * cell, y: ey + 1 + cj * cell,
            width: cell - 1, height: cell - 1,
            fill: labelBg, opacity: 0.9,
          }));
        }
      }
    } else {
      const fontSize = Math.min(
        (elem.fontSize || 10) * Math.min(scaleX, scaleY),
        eh * 0.75,
        12,
      );
      parent.appendChild(txt(elem.content, {
        x: ex + ew / 2,
        y: ey + eh / 2,
        "text-anchor":       "middle",
        "dominant-baseline": "middle",
        "font-family":       "sans-serif",
        "font-size":         fontSize,
        "font-weight":       elem.bold ? "700" : "400",
        fill:                elem.color || tf,
      }));
    }
  }
}

// ─── Ruler renderer ───────────────────────────────────────────────────────────

function renderRuler(
  parent: SVGElement,
  x: number,
  yStart: number,
  totalHeight: number,
  modelHeightMm: number,
) {
  const pixelsPerMm = totalHeight / modelHeightMm;
  
  parent.appendChild(rect({ 
    x: x - 32, 
    y: yStart, 
    width: 18, 
    height: totalHeight, 
    fill: "#f8f8f8", 
    stroke: "#ddd", 
    "stroke-width": 0.5, 
    rx: 1 
  }));

  for (let mm = 0; mm <= modelHeightMm; mm += 10) {
    const y = yStart + mm * pixelsPerMm;
    
    if (mm % 50 === 0) {
      parent.appendChild(ln({ 
        x1: x - 32, y1: y, x2: x - 8, y2: y, 
        stroke: "#555", "stroke-width": 0.8 
      }));
      parent.appendChild(txt(`${mm}`, {
        x: x - 11, y: y + 4,
        "text-anchor": "end",
        "font-family": "sans-serif",
        "font-size": 7,
        fill: "#555",
      }));
    } else {
      parent.appendChild(ln({ 
        x1: x - 26, y1: y, x2: x - 8, y2: y, 
        stroke: "#bbb", "stroke-width": 0.4 
      }));
    }
  }

  parent.appendChild(txt("mm", {
    x: x - 11,
    y: yStart - 6,
    "text-anchor": "end",
    "font-family": "sans-serif",
    "font-size": 7,
    fill: "#999",
  }));
}

// ─── Container shape renderers ────────────────────────────────────────────────

type DrawCtx = {
  svg: SVGSVGElement;
  cc: string;
  lc: string;
  elements: CanvasElement[];
  paperWidth: number;
  paperHeight: number;
  modelScale: number;
  containerWidth: number;
  containerHeight: number;
};

const SHAPES: Record<ContainerType, (ctx: DrawCtx) => void> = {

  bottle({ svg, cc, lc, elements, paperWidth, paperHeight, modelScale, containerWidth, containerHeight }) {
    const cx = 170, cy = 350;
    const bW = containerWidth * 0.9;
    const bodyH = containerHeight * 0.72;
    const neckH = containerHeight * 0.16;
    const neckW = containerWidth * 0.42;
    const capH = containerHeight * 0.08;
    const bTop = cy - bodyH - neckH;
    const dark = shadeHex(cc, -50), light = shadeHex(cc, 50);
    const grp = g();

    grp.appendChild(p({ fill: cc, stroke: dark, "stroke-width": 0.8,
      d: `M${cx-bW/2} ${bTop+neckH+bodyH*0.08} Q${cx-bW/2-6} ${bTop+neckH+bodyH*0.3} ${cx-bW/2} ${bTop+neckH+bodyH*0.55} L${cx-bW/2} ${cy} Q${cx} ${cy+12} ${cx+bW/2} ${cy} L${cx+bW/2} ${bTop+neckH+bodyH*0.55} Q${cx+bW/2+6} ${bTop+neckH+bodyH*0.3} ${cx+bW/2} ${bTop+neckH+bodyH*0.08} Z`,
    }));
    grp.appendChild(p({ fill: "none", stroke: light, "stroke-width": 3, opacity: 0.3,
      d: `M${cx-bW/2+8} ${bTop+neckH+bodyH*0.12} L${cx-bW/2+8} ${cy-12}`,
    }));
    grp.appendChild(rect({ x: cx-neckW/2, y: bTop, width: neckW, height: neckH+8, fill: shadeHex(cc, -15), stroke: dark, "stroke-width": 0.5, rx: 2 }));
    grp.appendChild(rect({ x: cx-neckW/2-4, y: bTop-capH, width: neckW+8, height: capH+3, fill: shadeHex(cc,-60), rx: 3, stroke: shadeHex(cc,-80), "stroke-width": 0.5 }));
    for (let i = 0; i < 6; i++) {
      grp.appendChild(ln({ x1: cx-neckW/2-3, y1: bTop-capH+3+i*3.5, x2: cx+neckW/2+3, y2: bTop-capH+3+i*3.5, stroke: shadeHex(cc,-80), "stroke-width": 0.5, opacity: 0.5 }));
    }

    const labelSlotH = bodyH * 0.58;
    const labelSlotW = bW * 0.78;
    const labelSlotY = bTop + neckH + bodyH * 0.18;
    const labelSlotX = cx - labelSlotW / 2;
    
    const effectiveSlotW = labelSlotW / modelScale;
    const effectiveSlotH = labelSlotH / modelScale;
    const slotX = labelSlotX + (labelSlotW - effectiveSlotW) / 2;
    const slotY = labelSlotY + (labelSlotH - effectiveSlotH) / 2;
    
    const lbl = fitLabel(slotX, slotY, effectiveSlotW, effectiveSlotH, paperWidth, paperHeight);
    grp.appendChild(rect({ x: lbl.x, y: lbl.y, width: lbl.w, height: lbl.h, fill: lc, rx: 2, stroke: shadeHex(lc,-28), "stroke-width": 0.4 }));
    renderLabelElements(grp, elements, paperWidth, paperHeight, lbl.x, lbl.y, lbl.w, lbl.h, lc);

    renderRuler(grp, cx - bW/2 - 22, bTop, bodyH + neckH, containerHeight);

    grp.appendChild(ell({ cx, cy: cy+8, rx: bW/2, ry: 6, fill: "#000", opacity: 0.12 }));
    svg.appendChild(grp);
  },

  can({ svg, cc, lc, elements, paperWidth, paperHeight, modelScale, containerWidth, containerHeight }) {
    const cx = 170, cy = 300;
    const cW = containerWidth;
    const cH = containerHeight;
    const dark = shadeHex(cc,-55), light = shadeHex(cc,45);
    const grp = g();

    grp.appendChild(rect({ x: cx-cW/2, y: cy-cH/2, width: cW, height: cH, fill: cc, stroke: dark, "stroke-width": 0.5, rx: 2 }));
    grp.appendChild(ell({ cx, cy: cy-cH/2, rx: cW/2, ry: 8, fill: shadeHex(cc,20), stroke: dark, "stroke-width": 0.5 }));
    grp.appendChild(ell({ cx, cy: cy-cH/2, rx: cW/2-3, ry: 6, fill: shadeHex(cc,35), stroke: dark, "stroke-width": 0.3 }));
    grp.appendChild(ell({ cx, cy: cy+cH/2, rx: cW/2, ry: 8, fill: shadeHex(cc,-15), stroke: dark, "stroke-width": 0.5 }));
    grp.appendChild(rect({ x: cx-cW/2+6, y: cy-cH/2+14, width: 5, height: cH-28, fill: light, opacity: 0.25, rx: 2 }));
    grp.appendChild(ell({ cx, cy: cy-cH/2-5, rx: 10, ry: 4, fill: shadeHex(cc,-70), stroke: shadeHex(cc,-85), "stroke-width": 0.5 }));
    grp.appendChild(ell({ cx, cy: cy-cH/2-3, rx: 7, ry: 3, fill: shadeHex(cc,-60) }));

    const labelSlotW = cW * 0.88;
    const labelSlotH = cH * 0.68;
    const labelSlotX = cx - labelSlotW / 2;
    const labelSlotY = cy - labelSlotH / 2;
    
    const effectiveSlotW = labelSlotW / modelScale;
    const effectiveSlotH = labelSlotH / modelScale;
    const slotX = labelSlotX + (labelSlotW - effectiveSlotW) / 2;
    const slotY = labelSlotY + (labelSlotH - effectiveSlotH) / 2;
    
    const lbl = fitLabel(slotX, slotY, effectiveSlotW, effectiveSlotH, paperWidth, paperHeight);
    grp.appendChild(rect({ x: lbl.x, y: lbl.y, width: lbl.w, height: lbl.h, fill: lc, stroke: shadeHex(lc,-18), "stroke-width": 0.3 }));
    renderLabelElements(grp, elements, paperWidth, paperHeight, lbl.x, lbl.y, lbl.w, lbl.h, lc);

    renderRuler(grp, cx - cW/2 - 22, cy - cH/2, cH, containerHeight);

    grp.appendChild(ell({ cx, cy: cy+cH/2+8, rx: cW/2, ry: 5, fill: "#000", opacity: 0.1 }));
    svg.appendChild(grp);
  },

  pouch({ svg, cc, lc, elements, paperWidth, paperHeight, modelScale, containerWidth, containerHeight }) {
    const cx = 170, cy = 290;
    const pw = containerWidth;
    const ph = containerHeight;
    const dark = shadeHex(cc,-55);
    const grp = g();

    grp.appendChild(p({ fill: cc, stroke: dark, "stroke-width": 0.8,
      d: `M${cx-pw/2+18} ${cy-ph/2} Q${cx} ${cy-ph/2-12} ${cx+pw/2-18} ${cy-ph/2} Q${cx+pw/2+8} ${cy-ph/4} ${cx+pw/2} ${cy} Q${cx+pw/2+8} ${cy+ph/4} ${cx+pw/2-18} ${cy+ph/2} Q${cx} ${cy+ph/2+8} ${cx-pw/2+18} ${cy+ph/2} Q${cx-pw/2-8} ${cy+ph/4} ${cx-pw/2} ${cy} Q${cx-pw/2-8} ${cy-ph/4} ${cx-pw/2+18} ${cy-ph/2} Z`,
    }));
    for (let i = 0; i < 4; i++) {
      grp.appendChild(ln({ x1: cx-pw/2+12+i*3, y1: cy-ph/2+6, x2: cx-pw/2+12+i*3, y2: cy+ph/2-6, stroke: shadeHex(cc,40), "stroke-width": 1.5, opacity: 0.12 }));
    }
    grp.appendChild(p({ fill: "none", stroke: shadeHex(cc,-40), "stroke-width": 2.5, opacity: 0.4,
      d: `M${cx-pw/2+22} ${cy-ph/2+16} Q${cx} ${cy-ph/2+6} ${cx+pw/2-22} ${cy-ph/2+16}`,
    }));
    grp.appendChild(p({ fill: "none", stroke: shadeHex(cc,-40), "stroke-width": 2.5, opacity: 0.4,
      d: `M${cx-pw/2+22} ${cy+ph/2-8} Q${cx} ${cy+ph/2+4} ${cx+pw/2-22} ${cy+ph/2-8}`,
    }));
    grp.appendChild(p({ fill: "none", stroke: shadeHex(cc,-70), "stroke-width": 1.2,
      d: `M${cx+pw/2-35} ${cy-ph/2+4} L${cx+pw/2-18} ${cy-ph/2+4}`,
      "stroke-dasharray": "3 2",
    }));
    grp.appendChild(ell({ cx: cx+pw/2-12, cy: cy-ph/2+12, rx: 4, ry: 4, fill: "none", stroke: dark, "stroke-width": 1.2 }));

    const labelSlotW = pw * 0.62;
    const labelSlotH = ph * 0.5;
    const labelSlotX = cx - labelSlotW / 2;
    const labelSlotY = cy - labelSlotH / 2 + 8;
    
    const effectiveSlotW = labelSlotW / modelScale;
    const effectiveSlotH = labelSlotH / modelScale;
    const slotX = labelSlotX + (labelSlotW - effectiveSlotW) / 2;
    const slotY = labelSlotY + (labelSlotH - effectiveSlotH) / 2;
    
    const lbl = fitLabel(slotX, slotY, effectiveSlotW, effectiveSlotH, paperWidth, paperHeight);
    grp.appendChild(rect({ x: lbl.x, y: lbl.y, width: lbl.w, height: lbl.h, fill: lc, rx: 4, stroke: shadeHex(lc,-28), "stroke-width": 0.4 }));
    renderLabelElements(grp, elements, paperWidth, paperHeight, lbl.x, lbl.y, lbl.w, lbl.h, lc);

    renderRuler(grp, cx - pw/2 - 22, cy - ph/2, ph, containerHeight);

    grp.appendChild(ell({ cx, cy: cy+ph/2+6, rx: pw/3.5, ry: 5, fill: "#000", opacity: 0.08 }));
    svg.appendChild(grp);
  },

  jar({ svg, cc, lc, elements, paperWidth, paperHeight, modelScale, containerWidth, containerHeight }) {
    const cx = 170, cy = 300;
    const jW = containerWidth;
    const jH = containerHeight * 0.78;
    const lidH = containerHeight * 0.18;
    const dark = shadeHex(cc,-55), light = shadeHex(cc,50);
    const grp = g();

    grp.appendChild(p({ fill: cc, stroke: dark, "stroke-width": 0.8,
      d: `M${cx-jW/2+10} ${cy-jH/2+lidH} L${cx-jW/2} ${cy+jH/2} Q${cx} ${cy+jH/2+14} ${cx+jW/2} ${cy+jH/2} L${cx+jW/2-10} ${cy-jH/2+lidH} Z`,
    }));
    grp.appendChild(p({ fill: "none", stroke: light, "stroke-width": 5, opacity: 0.25,
      d: `M${cx-jW/2+14} ${cy-jH/2+lidH+12} L${cx-jW/2+14} ${cy+jH/2-12}`,
    }));
    grp.appendChild(ell({ cx, cy: cy+jH/2+4, rx: jW/2, ry: 8, fill: shadeHex(cc,-18), stroke: dark, "stroke-width": 0.5 }));
    grp.appendChild(rect({ x: cx-jW/2-6, y: cy-jH/2-lidH+10, width: jW+12, height: lidH+4, fill: shadeHex(cc,-35), rx: 4, stroke: shadeHex(cc,-60), "stroke-width": 0.5 }));
    grp.appendChild(ell({ cx, cy: cy-jH/2-lidH+12, rx: jW/2+4, ry: 10, fill: shadeHex(cc,-25), stroke: shadeHex(cc,-55), "stroke-width": 0.5 }));
    for (let i = 0; i < 6; i++) {
      grp.appendChild(ln({ x1: cx-jW/2-4, y1: cy-jH/2-lidH+14+i*2.5, x2: cx+jW/2+4, y2: cy-jH/2-lidH+14+i*2.5, stroke: shadeHex(cc,-55), "stroke-width": 0.6, opacity: 0.35 }));
    }

    const labelSlotW = jW * 0.72;
    const labelSlotH = jH * 0.52;
    const labelSlotX = cx - labelSlotW / 2;
    const labelSlotY = cy - labelSlotH / 2 + lidH * 0.3;
    
    const effectiveSlotW = labelSlotW / modelScale;
    const effectiveSlotH = labelSlotH / modelScale;
    const slotX = labelSlotX + (labelSlotW - effectiveSlotW) / 2;
    const slotY = labelSlotY + (labelSlotH - effectiveSlotH) / 2;
    
    const lbl = fitLabel(slotX, slotY, effectiveSlotW, effectiveSlotH, paperWidth, paperHeight);
    grp.appendChild(rect({ x: lbl.x, y: lbl.y, width: lbl.w, height: lbl.h, fill: lc, rx: 3, stroke: shadeHex(lc,-28), "stroke-width": 0.4 }));
    renderLabelElements(grp, elements, paperWidth, paperHeight, lbl.x, lbl.y, lbl.w, lbl.h, lc);

    renderRuler(grp, cx - jW/2 - 22, cy - jH/2, jH + lidH, containerHeight);

    grp.appendChild(ell({ cx, cy: cy+jH/2+12, rx: jW/2, ry: 6, fill: "#000", opacity: 0.1 }));
    svg.appendChild(grp);
  },

  box({ svg, cc, lc, elements, paperWidth, paperHeight, modelScale, containerWidth, containerHeight }) {
    const cx = 170, cy = 290;
    const bw = containerWidth;
    const bh = containerHeight;
    const sideW = containerWidth * 0.3;
    const topH = containerHeight * 0.08;
    const dark = shadeHex(cc,-55), mid = shadeHex(cc,-22), light = shadeHex(cc,20);
    const grp = g();

    const bx = cx - bw/2;
    const by = cy - bh/2;

    grp.appendChild(rect({ x: bx, y: by+topH, width: bw, height: bh, fill: cc, stroke: dark, "stroke-width": 0.5 }));
    grp.appendChild(poly({ fill: mid, stroke: dark, "stroke-width": 0.5,
      points: `${bx+bw},${by+topH} ${bx+bw+sideW},${by} ${bx+bw+sideW},${by+bh-topH} ${bx+bw},${by+bh+topH}`,
    }));
    grp.appendChild(poly({ fill: light, stroke: dark, "stroke-width": 0.5,
      points: `${bx},${by+topH} ${bx+bw},${by+topH} ${bx+bw+sideW},${by} ${bx+sideW},${by}`,
    }));
    grp.appendChild(rect({ x: bx+4, y: by+topH-3, width: bw-8, height: 6, fill: shadeHex(cc,-10), rx: 1 }));
    grp.appendChild(rect({ x: bx+6, y: by+topH+8, width: 3, height: bh-16, fill: light, opacity: 0.2, rx: 1 }));

    const labelSlotW = bw * 0.78;
    const labelSlotH = bh * 0.72;
    const labelSlotX = bx + (bw - labelSlotW) / 2;
    const labelSlotY = by + topH + (bh - labelSlotH) / 2;
    
    const effectiveSlotW = labelSlotW / modelScale;
    const effectiveSlotH = labelSlotH / modelScale;
    const slotX = labelSlotX + (labelSlotW - effectiveSlotW) / 2;
    const slotY = labelSlotY + (labelSlotH - effectiveSlotH) / 2;
    
    const lbl = fitLabel(slotX, slotY, effectiveSlotW, effectiveSlotH, paperWidth, paperHeight);
    grp.appendChild(rect({ x: lbl.x, y: lbl.y, width: lbl.w, height: lbl.h, fill: lc, rx: 2, stroke: shadeHex(lc,-20), "stroke-width": 0.4 }));
    renderLabelElements(grp, elements, paperWidth, paperHeight, lbl.x, lbl.y, lbl.w, lbl.h, lc);

    renderRuler(grp, bx - 22, by + topH, bh, containerHeight);

    grp.appendChild(ell({ cx: cx+sideW/2, cy: cy+bh/2+8, rx: bw/2+sideW/2, ry: 5, fill: "#000", opacity: 0.08 }));
    svg.appendChild(grp);
  },

  sachet({ svg, cc, lc, elements, paperWidth, paperHeight, modelScale, containerWidth, containerHeight }) {
    const cx = 170, cy = 260;
    const sw = containerWidth;
    const sh = containerHeight;
    const dark = shadeHex(cc,-55);
    const grp = g();

    grp.appendChild(rect({ x: cx-sw/2, y: cy-sh/2, width: sw, height: sh, fill: cc, rx: 6, stroke: dark, "stroke-width": 0.7 }));
    const sealW = sw * 0.08;
    grp.appendChild(rect({ x: cx-sw/2, y: cy-sh/2, width: sealW, height: sh, fill: shadeHex(cc,-28), rx: 6, stroke: dark, "stroke-width": 0.4 }));
    grp.appendChild(rect({ x: cx+sw/2-sealW, y: cy-sh/2, width: sealW, height: sh, fill: shadeHex(cc,-28), rx: 6, stroke: dark, "stroke-width": 0.4 }));
    for (let i = 0; i < 4; i++) {
      grp.appendChild(ln({ x1: cx-sw/2+sealW+4, y1: cy-sh/2+8+(sh-16)/4*i, x2: cx+sw/2-sealW-4, y2: cy-sh/2+8+(sh-16)/4*i, stroke: shadeHex(cc,30), "stroke-width": 0.8, opacity: 0.15 }));
    }
    grp.appendChild(ln({ x1: cx-sw/2+sealW+3, y1: cy-sh/2+3, x2: cx-sw/2+sealW+3, y2: cy+sh/2-3, stroke: shadeHex(cc,-70), "stroke-width": 0.8, "stroke-dasharray": "3 2.5", opacity: 0.45 }));
    grp.appendChild(p({ fill: "none", stroke: dark, "stroke-width": 1.2,
      d: `M${cx-sw/2+sealW-2} ${cy-sh/2+12} L${cx-sw/2+sealW+7} ${cy-sh/2+18} L${cx-sw/2+sealW-2} ${cy-sh/2+24}`,
    }));

    const labelSlotW = sw - sealW * 2 - 14;
    const labelSlotH = sh * 0.62;
    const labelSlotX = cx - labelSlotW / 2;
    const labelSlotY = cy - labelSlotH / 2;
    
    const effectiveSlotW = labelSlotW / modelScale;
    const effectiveSlotH = labelSlotH / modelScale;
    const slotX = labelSlotX + (labelSlotW - effectiveSlotW) / 2;
    const slotY = labelSlotY + (labelSlotH - effectiveSlotH) / 2;
    
    const lbl = fitLabel(slotX, slotY, effectiveSlotW, effectiveSlotH, paperWidth, paperHeight);
    grp.appendChild(rect({ x: lbl.x, y: lbl.y, width: lbl.w, height: lbl.h, fill: lc, rx: 2, stroke: shadeHex(lc,-20), "stroke-width": 0.3 }));
    renderLabelElements(grp, elements, paperWidth, paperHeight, lbl.x, lbl.y, lbl.w, lbl.h, lc);

    renderRuler(grp, cx - sw/2 - 22, cy - sh/2, sh, containerHeight);

    grp.appendChild(ell({ cx, cy: cy+sh/2+6, rx: sw/3.5, ry: 4, fill: "#000", opacity: 0.08 }));
    svg.appendChild(grp);
  },
};

// ─── Container config ─────────────────────────────────────────────────────────

const CONTAINER_OPTIONS: { type: ContainerType; label: string }[] = [
  { type: "bottle", label: "Bottle"     },
  { type: "can",    label: "Can"        },
  { type: "pouch",  label: "Flat pouch" },
  { type: "jar",    label: "Wide jar"   },
  { type: "box",    label: "Box"        },
  { type: "sachet", label: "Sachet"     },
];

const LABEL_COLORS = [
  { hex: "#ffffff", border: "#ccc" },
  { hex: "#fff8e1" },
  { hex: "#e8f5e9" },
  { hex: "#e3f2fd" },
  { hex: "#fce4ec" },
  { hex: "#1a1a2e" },
  { hex: "#2d5016" },
];

const CONTAINER_COLORS = [
  "#b0bec5", "#78909c", "#a5d6a7",
  "#90caf9", "#f48fb1", "#ffe082", "#ce93d8",
];

const RATIO_PRESETS = [
  { label: "1:1", w: 100, h: 100 },
  { label: "1:2", w: 70, h: 140 },
  { label: "1:3", w: 60, h: 180 },
  { label: "2:3", w: 80, h: 120 },
  { label: "3:4", w: 90, h: 120 },
  { label: "Wide", w: 140, h: 80 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductMockupPreview({
  elements = [],
  paperWidth,
  paperHeight,
  onClose,
}: ProductMockupPreviewProps) {
  const svgRef          = useRef<SVGSVGElement>(null);
  const [type, setType] = useState<ContainerType>("bottle");
  const [lc, setLc]     = useState("#ffffff");
  const [cc, setCc]     = useState("#b0bec5");
  const [containerScale, setContainerScale] = useState(1);
  const [containerHeight, setContainerHeight] = useState(CONTAINER_DEFAULTS["bottle"].height);
  const [containerWidth, setContainerWidth] = useState(CONTAINER_DEFAULTS["bottle"].width);
  const [lockRatio, setLockRatio] = useState(false);
  const ratioRef = useRef(containerHeight / containerWidth);

  // Update dimensions when container type changes
  useEffect(() => {
    setContainerWidth(CONTAINER_DEFAULTS[type].width);
    setContainerHeight(CONTAINER_DEFAULTS[type].height);
    ratioRef.current = CONTAINER_DEFAULTS[type].height / CONTAINER_DEFAULTS[type].width;
  }, [type]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !elements || elements.length === 0) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    SHAPES[type]({ svg, cc, lc, elements, paperWidth, paperHeight, modelScale: containerScale, containerWidth, containerHeight });
  }, [type, lc, cc, elements, paperWidth, paperHeight, containerScale, containerWidth, containerHeight]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl mx-4 overflow-hidden w-full max-w-4xl max-h-[90vh] flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left Panel: Config ────────────────────────────────────────── */}
        <div className="w-64 shrink-0 border-r border-gray-100 p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-800 text-sm">Preview</span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {paperWidth} × {paperHeight} mm
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Container type */}
          <div>
            <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2 block">
              Container
            </label>
            <div className="flex flex-col gap-1">
              {CONTAINER_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setType(opt.type)}
                  className={`px-3 py-1.5 rounded-lg text-xs text-left transition ${
                    type === opt.type
                      ? "bg-indigo-50 text-indigo-700 font-medium border border-indigo-200"
                      : "text-gray-500 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Container Dimensions */}
          <div>
            <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2 block">
              Dimensions (mm)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400">Width</label>
                <input
                  type="number"
                  value={containerWidth}
                  onChange={(e) => {
                    const w = Math.max(20, parseInt(e.target.value) || 20);
                    setContainerWidth(w);
                    if (lockRatio) {
                      setContainerHeight(Math.round(w * ratioRef.current));
                    }
                  }}
                  className="w-full mt-0.5 px-2 py-1.5 border border-gray-300 rounded text-xs text-center"
                  min={20}
                  max={300}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Height</label>
                <input
                  type="number"
                  value={containerHeight}
                  onChange={(e) => {
                    const h = Math.max(20, parseInt(e.target.value) || 20);
                    setContainerHeight(h);
                    if (lockRatio) {
                      setContainerWidth(Math.round(h / ratioRef.current));
                    }
                  }}
                  className="w-full mt-0.5 px-2 py-1.5 border border-gray-300 rounded text-xs text-center"
                  min={20}
                  max={500}
                />
              </div>
            </div>
            {/* Ratio display and lock */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-gray-50 rounded px-2 py-1.5 text-center">
                <span className="text-[10px] text-gray-400">Ratio </span>
                <span className="text-xs font-medium text-gray-600">
                  1:{(containerHeight / containerWidth).toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => {
                  setLockRatio(!lockRatio);
                  ratioRef.current = containerHeight / containerWidth;
                }}
                className={`p-1.5 rounded transition ${
                  lockRatio ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400 hover:text-gray-600"
                }`}
                title={lockRatio ? "Unlock ratio" : "Lock ratio"}
              >
                {lockRatio ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                    <path d="M12 15v3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Quick Ratio Presets */}
          <div>
            <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2 block">
              Quick Ratio
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {RATIO_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setContainerWidth(preset.w);
                    setContainerHeight(preset.h);
                    ratioRef.current = preset.h / preset.w;
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] border transition ${
                    containerWidth === preset.w && containerHeight === preset.h
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-medium"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Label color */}
          <div>
            <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2 block">
              Label Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {LABEL_COLORS.map(({ hex, border }) => (
                <button
                  key={hex}
                  onClick={() => setLc(hex)}
                  className={`w-7 h-7 rounded-full transition ring-offset-1 ${
                    lc === hex ? "ring-2 ring-indigo-500" : ""
                  }`}
                  style={{
                    background: hex,
                    border: `1px solid ${border || shadeHex(hex, -30)}`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Container color */}
          <div>
            <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2 block">
              Container Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {CONTAINER_COLORS.map((hex) => (
                <button
                  key={hex}
                  onClick={() => setCc(hex)}
                  className={`w-7 h-7 rounded-full transition ring-offset-1 ${
                    cc === hex ? "ring-2 ring-indigo-500" : ""
                  }`}
                  style={{
                    background: hex,
                    border: `1px solid ${shadeHex(hex, -30)}`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Model Scale */}
          <div>
            <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2 block">
              Label Scale: {Math.round(containerScale * 100)}%
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={containerScale}
                onChange={(e) => setContainerScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setContainerScale(Math.max(0.5, containerScale - 0.1))}
                  className="flex-1 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition"
                >
                  −
                </button>
                <button
                  onClick={() => setContainerScale(Math.min(2, containerScale + 0.1))}
                  className="flex-1 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => setContainerScale(1)}
                className="w-full py-1 text-[11px] text-gray-400 hover:text-indigo-600 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Panel: Preview ─────────────────────────────────────────── */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 overflow-auto">
          <svg
            ref={svgRef}
            width={340}
            height={520}
            viewBox="0 0 340 520"
            style={{ overflow: "visible" }}
          />
        </div>
      </div>
    </div>
  );
}