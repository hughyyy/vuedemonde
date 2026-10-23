#!/usr/bin/env node
/**
 * Visual regression harness for the kit's render surface.
 *
 * The harness renders the whole catalogue (every family section across themes
 * and interaction states, plus the 16-theme banner and the app shell),
 * screenshots each frame, then compares it against the previous render:
 *
 *   1. cheap gate — 64-bit dHash per frame (one downsample pass);
 *   2. only on a hash mismatch — full-resolution pixel diff (ratio + bbox);
 *   3. verdicts: identical / noise (below ratio threshold) / changed.
 *
 * ONLY "changed" frames are handed to the vision model for analysis (or a
 * human reviewer) — see the printed report and visual/results.json. The
 * harness itself never calls a model: it isolates the signal, the consumer
 * decides what the delta means.
 *
 * Determinism: the page clock is frozen (calendar seed grids, "today"
 * highlights and terminal timestamps cannot drift between runs),
 * prefers-reduced-motion is emulated (kit --dur-* collapse to 0), fixed
 * viewport + deviceScaleFactor, fonts awaited before every shot. Baselines
 * are therefore stable on a given machine/browser build; cross-machine AA
 * differences land in the "noise" bucket, not "changed".
 *
 * Usage:
 *   node scripts/visual-regression.mjs capture            # regenerate baseline from current render
 *   node scripts/visual-regression.mjs test               # compare current render vs baseline (exit 1 on changes)
 *   node scripts/visual-regression.mjs update             # promote the current render to baseline
 *   node scripts/visual-regression.mjs report             # print results.json without rendering
 *   flag --only=<id>        # limit to one shot id (e.g. family-charts-dark-base)
 *   flag --allow-changes    # exit 0 even when changes are found
 *
 * npm: npm run visual:capture | visual:test | visual:update | visual:report
 */
import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { compareFrames, diffOverlay, readPng, writePng } from "./visual-compare.mjs";
const ROOT = new URL("..", import.meta.url).pathname;
const DIR = join(ROOT, "visual");
const BASELINE = join(DIR, "baseline");
const CURRENT = join(DIR, "current");
const DIFF = join(DIR, "diff");
const RESULTS = join(DIR, "results.json");
const PORT = 5281;
const BASE = `http://127.0.0.1:${PORT}`;

const FAMILIES = ["primitives", "inputs", "overlays", "navigation", "data", "layout", "charts", "calendar", "board"];
const THEMES = ["light", "dark", "thermal"];
const INTERACTIONS = ["base", "hover", "focus"];
const FROZEN_NOW = new Date("2026-05-13T10:00:00Z"); // pinned calendar anchor

/** id → { kind, url, selector, viewport } */
function matrix() {
  const shots = [];
  for (const family of FAMILIES) {
    for (const theme of THEMES) {
      for (const interaction of INTERACTIONS) {
        shots.push({
          id: `family-${family}-${theme}-${interaction}`,
          kind: "family",
          family,
          theme,
          interaction,
          viewport: { width: 1000, height: 1000 },
          url: `${BASE}/?print=family&id=${family}&theme=${theme}`,
          selector: "#print-section",
        });
      }
    }
  }
  shots.push({ id: "banner-all-themes", kind: "banner", interaction: "base", viewport: { width: 1440, height: 1000 }, url: `${BASE}/?print=banner`, selector: "#banner" });
  shots.push({ id: "shell-dark-default", kind: "shell", interaction: "base", viewport: { width: 1280, height: 900 }, url: `${BASE}/`, selector: null });
  return shots;
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    p.stderr?.on("data", (d) => (err += d));
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} failed (${code}): ${err.slice(0, 400)}`))));
    p.on("error", reject);
  });
}

async function waitForServer(url, tries = 90) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server at ${url} did not become ready`);
}

/** Freeze the clock so every frame is byte-reproducible across runs. */
function installFrozenClock(page) {
  return page.clock.install({ time: FROZEN_NOW });
}

const FOCUSABLE = 'button, [role="button"], input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';
/** FOCUSABLE controls in the harness. */

/** debug facts recorded when VISUAL_DEBUG=1, written next to the render dir */
const debugLog = [];

/** Crop an image to a bbox and nearest-neighbour scale it up — the compact
 * artifact vision models can read reliably. */
function cropUpscaled(img, bbox, scale) {
  const w = bbox.w * scale;
  const h = bbox.h * scale;
  const out = { width: w, height: h, data: Buffer.alloc(w * h * 4) };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = ((bbox.y + Math.floor(y / scale)) * img.width + (bbox.x + Math.floor(x / scale))) * 4;
      const oi = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) out.data[oi + c] = img.data[si + c];
    }
  }
  return out;
}

/** First focusable control in the frame that is actually reachable — visible
 * and not covered by a higher element (print-mode overlays keep open dialogs
 * and drawers over parts of the section; hovering those would retry into a
 * Playwright timeout). Returns its index or -1. */
async function pickControl(page, selector) {
  return page.evaluate(
    (sel) => {
      const root = document.querySelector("#print-section");
      if (!root) return -1;
      const els = Array.from(root.querySelectorAll(sel));
      for (let k = 0; k < els.length; k++) {
        const el = els[k];
        if (el.disabled || el.getAttribute("aria-disabled") === "true") continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const s = getComputedStyle(el);
        if (s.visibility === "hidden" || s.display === "none") continue;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const top = document.elementFromPoint(cx, cy);
        if (top && (top === el || el.contains(top))) return k;
      }
      return -1;
    },
    selector,
  );
}

async function shotWithState(page, shot) {
  // the pointer position PERSISTS across page loads within a page object:
  // without a reset, every render inherits the previous shot's :hover state
  // somewhere in the new document (and CSS :hover is position-based, so the
  // frame is session-history-dependent — a reproducible-render bug caught by
  // the very first comparison run)
  await page.mouse.move(0, 0);
  await page.setViewportSize(shot.viewport);
  await page.goto(shot.url);
  await page.evaluate(() => document.fonts?.ready);
  // let the frozen-clock render + any 0ms transitions settle
  await page.waitForTimeout(120);

  const applyInteraction = async () => {
    if (shot.interaction === "base" || !shot.selector) return true;
    const idx = await pickControl(page, FOCUSABLE);
    if (idx < 0) return false;
    const control = page.locator(FOCUSABLE).nth(idx);
    if (shot.interaction === "hover") {
      await control.hover();
      await page.waitForTimeout(60); // hover-reveal transitions
    } else {
      await control.focus();
      await page.waitForTimeout(60);
    }
    return true;
  };

  const applied = await applyInteraction();
  // optional deep-debug dump (VISUAL_DEBUG=1): layout facts per shot
  if (process.env.VISUAL_DEBUG) {
    const facts = await page.evaluate(() => ({
      scrollY: Math.round(window.scrollY),
      sectionH: Math.round(document.querySelector("#print-section")?.getBoundingClientRect().height ?? 0),
      panes: [...document.querySelectorAll(".pane-section-head")].map((h) => h.getAttribute("aria-expanded")),
      deferred: !!document.querySelector(".deferred-box"),
      hovered: document.activeElement?.className ?? null,
    }));
    debugLog.push({ id: shot.id, ...facts });
  }
  // element shot for bounded frames, full viewport for the shell
  if (shot.selector) {
    await page.locator(shot.selector).screenshot({ path: shot.path });
  } else {
    await page.screenshot({ path: shot.path });
  }
  return applied;
}

async function renderAll(dir) {
  if (!only) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const manifest = {};
  let skipped = 0;

  console.log("▶ building playground demo (vite build → dist-demo)…");
  await run("npx", ["vite", "build", "--config", "vite.demo.config.ts"]);

  console.log(`▶ serving demo on :${PORT}…`);
  const preview = spawn("npx", ["vite", "preview", "--config", "vite.demo.config.ts", "--host", "127.0.0.1", "--port", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
  });
  let browser;
  try {
    await waitForServer(`${BASE}/`);
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });
    // MediaGallery pulls remote picsum images — network timing would make the
    // gallery card nondeterministic (and machines without the network would
    // render broken states). Serve a fixed placeholder instead so the frame
    // is identical everywhere.
    const placeholder = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAFElEQVR42mP8z8AARMAgYJyKAAAAAAElFTkSuQmCC",
      "base64",
    );
    await context.route("https://picsum.photos/**", (route) =>
      route.fulfill({ status: 200, contentType: "image/png", body: placeholder }),
    );
    const page = await context.newPage();
    await installFrozenClock(page);

    const shots = matrix();
    for (const shot of shots) {
      if (only && shot.id !== only) continue;
      shot.path = join(dir, `${shot.id}.png`);
      const applied = await shotWithState(page, shot);
      if (!applied) {
        skipped++;
        rmSync(shot.path, { force: true });
        console.log(`   – ${shot.id}  (no focusable control — skipped)`);
        continue;
      }
      const size = statSync(shot.path).size;
      manifest[shot.id] = { size };
      console.log(`   ✓ ${shot.id}  ${(size / 1024).toFixed(0)} kB`);
    }
    await context.close();
    await browser.close();
    browser = undefined;
  } finally {
    preview.kill();
  }
  if (skipped > 0) console.log(`   (${skipped} frames skipped — no focusable control)`);
  if (process.env.VISUAL_DEBUG) writeFileSync(join(DIR, `debug-${dir.endsWith("baseline") ? "base" : "cur"}.json`), JSON.stringify(debugLog, null, 2));
  return manifest;
}

async function cmdCapture() {
  const manifest = await renderAll(BASELINE);
  writeFileSync(join(DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\n✓ baseline regenerated: ${Object.keys(manifest).length} frames → visual/baseline/`);
}

async function cmdUpdate() {
  // promote the last tested render — no rebuild, no re-render
  const current = readdirSync(CURRENT).filter((f) => f.endsWith(".png"));
  if (current.length === 0) {
    console.error("no visual/current/ frames — run `npm run visual:test` first");
    process.exit(2);
  }
  rmSync(BASELINE, { recursive: true, force: true });
  mkdirSync(BASELINE, { recursive: true });
  const manifest = {};
  for (const f of current) {
    copyFileSync(join(CURRENT, f), join(BASELINE, f));
    manifest[f.replace(/\.png$/, "")] = { size: statSync(join(BASELINE, f)).size };
  }
  writeFileSync(join(DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`✓ baseline updated from current render: ${current.length} frames`);
}

async function cmdTest() {
  const baselineIds = readdirSync(BASELINE).filter((f) => f.endsWith(".png")).map((f) => f.replace(/\.png$/, ""));
  if (baselineIds.length === 0) {
    console.error("no baseline — run `npm run visual:capture` first");
    process.exit(2);
  }
  mkdirSync(DIFF, { recursive: true });
  rmSync(DIFF, { recursive: true, force: true });
  mkdirSync(DIFF, { recursive: true });
  rmSync(RESULTS, { force: true });

  const manifest = await renderAll(CURRENT);
  const results = { generatedAt: new Date().toISOString(), noiseRatio: 0.0005, frames: {} };

  let identical = 0;
  let noise = 0;
  let changed = 0;
  for (const id of Object.keys(manifest)) {
    if (only && id !== only) continue;
    const basePath = join(BASELINE, `${id}.png`);
    if (!existsSync(basePath)) {
      results.frames[id] = { verdict: "changed", reason: "no baseline" };
      changed++;
      console.log(`   CHANGED ${id}  (no baseline)`);
      continue;
    }
    const a = readPng(basePath);
    const b = readPng(join(CURRENT, `${id}.png`));
    const res = compareFrames(a, b);
    results.frames[id] = res;
    if (res.verdict === "changed") {
      changed++;
      const overlay = diffOverlay(b, a);
      writePng(join(DIFF, `${id}.png`), overlay);
      if (res.bbox) {
        // cropped + 2x upscaled overlay — the artifact the vision model can
        // actually read (full-frame overlays are too dense at 2000x4000+)
        writePng(join(DIFF, `${id}.crop.png`), cropUpscaled(overlay, res.bbox, 2));
      }
      console.log(`   CHANGED ${id}  ratio=${(res.diffRatio * 100).toFixed(4)}%  bbox=${res.bbox ? `${res.bbox.w}×${res.bbox.h}@(${res.bbox.x},${res.bbox.y})` : "size-mismatch"}`);
    } else if (res.verdict === "noise") {
      noise++;
      console.log(`   noise   ${id}  ratio=${(res.diffRatio * 100).toFixed(4)}%`);
    } else {
      identical++;
    }
  }
  results.counts = { identical, noise, changed };
  writeFileSync(RESULTS, JSON.stringify(results, null, 2));

  const diffFiles = readdirSync(DIFF).filter((f) => f.endsWith(".png"));
  console.log(`\n✓ ${identical} identical · ${noise} noise · ${changed} changed (${diffFiles.length} diff overlays in visual/diff/)`);
  if (changed > 0) {
    console.log(`▶ VISION GATE: ${changed} frames differ from the previous render — feed visual/diff/<id>.png (plus baseline/current pair) to the vision model: ${diffFiles.join(", ")}`);
    if (!allowChanges) process.exit(1);
  }
}

async function cmdReport() {
  let results;
  try {
    results = JSON.parse(readFileSync(RESULTS, "utf8"));
  } catch {
    console.error("no visual/results.json — run `npm run visual:test` first");
    process.exit(2);
  }
  console.log(`rendered ${results.generatedAt}`);
  console.log(`identical ${results.counts.identical} · noise ${results.counts.noise} · changed ${results.counts.changed}`);
  for (const [id, r] of Object.entries(results.frames)) {
    if (r.verdict === "changed") {
      console.log(`  CHANGED ${id}  ratio=${(r.diffRatio * 100).toFixed(4)}%  bbox=${r.bbox ? `${r.bbox.w}×${r.bbox.h}@(${r.bbox.x},${r.bbox.y})` : "size-mismatch"}${r.reason ? ` (${r.reason})` : ""}`);
    }
  }
}

const cmd = process.argv[2] ?? "test";
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const allowChanges = process.argv.includes("--allow-changes");
if (!["capture", "test", "update", "report"].includes(cmd)) {
  console.error(`unknown command "${cmd}" — use: capture | test | update | report`);
  process.exit(2);
}

async function main() {
  if (cmd === "capture") await cmdCapture();
  else if (cmd === "test") await cmdTest();
  else if (cmd === "update") await cmdUpdate();
  else await cmdReport();
}

main().catch((e) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
