#!/usr/bin/env node
/**
 * Visual defect sweep for the component catalogue.
 *
 * Splits each composite into its six per-theme cells, then for the two
 * reference themes (`light`, `dark`) produces:
 *   - a PNG crop for a vision model (`--emit=<dir>`), and
 *   - objective pixel facts: ink bounding box, blank ratio, text-clipping risk.
 *
 * The point is to look at 106 components systematically instead of by eye.
 * Emits `analysis/<id>-<theme>.png` plus `analysis/report.json`.
 *
 * Usage: node scripts/analyse-catalogue.mjs [--only=Id1,Id2] [--emit=dir]
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";
import { CATALOGUE_THEMES } from "./catalogue-themes.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const COMPONENTS = join(ROOT, "docs", "assets", "components");
const OUT = join(ROOT, "analysis");

/** Composite layout constants — must match render-release.mjs. */
const GUTTER = 24;
const LABEL_H = 34;
const GUTTER_BG = [0x10, 0x14, 0x18]; // composite backdrop

const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1]?.split(",");
const emit = process.argv.find((a) => a.startsWith("--emit="))?.split("=")[1];

/**
 * Decode a WebP. pngjs cannot read WebP, so this shells out to ImageMagick for
 * the decode and parses the resulting RGBA blob. Keeps the analysis dependency
 * free (magick is already the tool used for inspection).
 */
import { execFileSync } from "node:child_process";

function decode(file) {
  const raw = execFileSync("magick", [file, "-depth", "8", "rgba:-"], { maxBuffer: 1 << 28 });
  const dims = execFileSync("magick", ["identify", "-format", "%w %h", file], { encoding: "utf8" }).trim().split(" ").map(Number);
  return { width: dims[0], height: dims[1], data: raw };
}

const px = (img, x, y) => {
  const i = (img.width * y + x) * 4;
  return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
};

const isBg = (c) => Math.abs(c[0] - GUTTER_BG[0]) < 8 && Math.abs(c[1] - GUTTER_BG[1]) < 8 && Math.abs(c[2] - GUTTER_BG[2]) < 8;



/** Crop a rectangle to a standalone PNG buffer. */
function cropPng(img, x0, y0, w, h) {
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.min(img.width - 1, x0 + x);
      const sy = Math.min(img.height - 1, y0 + y);
      const s = (img.width * sy + sx) * 4;
      const d = (w * y + x) * 4;
      out.data[d] = img.data[s];
      out.data[d + 1] = img.data[s + 1];
      out.data[d + 2] = img.data[s + 2];
      out.data[d + 3] = 255;
    }
  }
  return PNG.sync.write(out);
}

/**
 * Objective checks on one cell.
 *
 * - `fill`: fraction of the cell's ink bounding box vs the cell — a low value
 *   means the render carries dead space (the defect class we just fixed).
 * - `edgeInk`: ink touching the cell border. A cell cropped too tightly shows
 *   content hard against an edge; that is what clipping looks like in a render.
 */
function cellMetrics(img, x0, y0, w, h) {
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1, ink = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = px(img, x0 + x, y0 + y);
      if (isBg(c)) continue;
      ink++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { empty: true, ink: 0 };
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  return {
    empty: false,
    ink,
    fill: (bw * bh) / (w * h),
    bbox: [minX, minY, bw, bh],
    edgeInk: { left: minX <= 1, top: minY <= 1, right: maxX >= w - 2, bottom: maxY >= h - 2 },
  };
}

const report = [];
const files = readdirSync(COMPONENTS).filter((f) => f.endsWith(".webp")).sort();
if (emit) mkdirSync(join(ROOT, emit), { recursive: true });

for (const file of files) {
  const id = file.replace(/\.webp$/, "");
  if (only && !only.some((o) => id === o.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase())) continue;
  const img = decode(join(COMPONENTS, file));
  const entry = { id, themes: CATALOGUE_THEMES, cells: [] };

  // The composite is a fixed 3×2 grid produced by render-release.mjs. Segment by
  // the known gutter geometry rather than guessing at content bands — a demo
  // with an internal horizontal rule (week-calendar) otherwise splits into
  // phantom rows.
  const colW = Math.floor((img.width - (3 + 1) * GUTTER) / 3);
  const rowH = Math.floor((img.height - (2 + 1) * GUTTER - 2 * LABEL_H) / 2);
  for (let ri = 0; ri < 2; ri++) {
    for (let ci = 0; ci < 3; ci++) {
      const theme = CATALOGUE_THEMES[ri * 3 + ci];
      const x0 = GUTTER + ci * (colW + GUTTER);
      const y0 = GUTTER + ri * (rowH + LABEL_H + GUTTER) + LABEL_H;
      const m = cellMetrics(img, x0, y0, colW, rowH);
      entry.cells.push({ theme, x: x0, y: y0, w: colW, h: rowH, ...m });
      if (emit && (theme === "light" || theme === "dark")) {
        writeFileSync(join(ROOT, emit, `${id}-${theme}.png`), cropPng(img, x0, y0, colW, rowH));
      }
    }
  }
  report.push(entry);
}

writeFileSync(join(ROOT, "analysis", "report.json"), JSON.stringify(report, null, 1));

// Summarise the defect classes that are measurable without a vision model.
const empty = report.flatMap((r) => r.cells.filter((c) => c.empty).map((c) => `${r.id}/${c.theme}`));
const lowFill = report
  .flatMap((r) => r.cells.filter((c) => !c.empty && c.fill < 0.35).map((c) => `${r.id}/${c.theme} fill=${c.fill.toFixed(2)}`));
const edge = report.flatMap((r) =>
  r.cells.filter((c) => !c.empty && (c.edgeInk.left || c.edgeInk.top || c.edgeInk.right || c.edgeInk.bottom))
    .map((c) => `${r.id}/${c.theme} edges=${Object.entries(c.edgeInk).filter(([, v]) => v).map(([k]) => k).join("+")}`));
console.log(`analysed ${report.length} composites`);
if (empty.length) console.log(`\nEMPTY CELLS (${empty.length}):\n  ${empty.join("\n  ")}`);
if (lowFill.length) console.log(`\nLOW FILL <0.35 (${lowFill.length}):\n  ${lowFill.join("\n  ")}`);
if (edge.length) console.log(`\nINK AT CELL EDGE (${edge.length}):\n  ${edge.join("\n  ")}`);
if (emit) console.log(`\ncrops → ${emit}/`);
