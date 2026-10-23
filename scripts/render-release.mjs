#!/usr/bin/env node
/**
 * Release rendering — generates the theme showcase banner + per-family
 * component catalogue PNGs for README.md (see docs/release-rendering.md).
 *
 * Usage:
 *   node scripts/render-release.mjs            # Tier 1 banner + Tier 2 catalogue
 *   node scripts/render-release.mjs banner     # Tier 1 only
 *   node scripts/render-release.mjs catalogue  # Tier 2 only
 *
 * Prereq: `npm install` (playwright + `npx playwright install chromium`).
 *
 * How it works: builds the playground (`vite build` → dist-demo), serves it
 * with `vite preview`, then drives headless Chromium against the print routes:
 *   ?print=banner                           → theme islands, 2 rows of 12 cards
 *   ?print=component&id=<id>&theme=<theme>  → ONE component demo, theme applied
 *
 * Tier 2 is one image per exported component: six themes rendered as six page
 * loads (the theme goes on <html>, so teleported overlay panels inherit it),
 * stitched 2×3 — dark row over light row — into
 * `docs/assets/components/<kebab-name>.webp`. See
 * docs/per-component-rendering.md for why islands cannot be used.
 *
 * Outputs are committed under docs/assets/ and referenced by README.md.
 *
 * Reproducibility: fixed viewport, deviceScaleFactor 2 (retina-crisp),
 * prefers-reduced-motion emulated (the kit zeroes every --dur-* under it), so
 * image diffs across releases show only real visual changes. Exception: the
 * calendar section seeds around the *current* date, so its grid shifts monthly
 * by design.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { extname, normalize } from "node:path";
import { join } from "node:path";
import { chromium } from "playwright";
import { CATALOGUE_THEMES as CATALOGUE_THEME_LIST } from "./catalogue-themes.mjs";


const ROOT = new URL("..", import.meta.url).pathname;
const ASSETS = join(ROOT, "docs", "assets");
/** Banner page width: 12 cards + 11 gaps + padding, so two rows of 12 fit. */
const BANNER_WIDTH = 2120;
const BASE = "http://demo.local";


function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    p.stderr?.on("data", (d) => (err += d));
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} failed (${code}): ${err.slice(0, 400)}`))));
    p.on("error", reject);
  });
}


async function shot(page, sel, path) {
  const loc = page.locator(sel);
  await loc.waitFor({ state: "attached", timeout: 15000 });
  await page.evaluate(() => document.fonts?.ready);
  // let scoped transitions/images settle (durations are 0ms under reduced motion)
  await page.waitForTimeout(120);
  await loc.screenshot({ path });
}

async function renderBanner(page) {
  // the banner carries 12 theme cards per row — needs the full 2 × 12 width
  await page.setViewportSize({ width: BANNER_WIDTH, height: 1000 });
  await page.goto(`${BASE}/?print=banner`, { timeout: 60000 });
  await shot(page, "#banner", join(ASSETS, "theme-banner.png"));
  console.log("  banner → theme-banner.png (two rows of 12 — all dark themes, then all light themes)");
}

/** Dark row first, then the light row — 2×3 composite (see §3.4 of the doc). */
const CATALOGUE_THEMES = CATALOGUE_THEME_LIST;
const COMPONENTS_DIR = join(ASSETS, "components");
const GUTTER = 24; // device px between cells, drawn at DPR 2 → 12 CSS px
const LABEL_H = 34; // device px reserved above each cell for its theme label

/** `AppTextarea` → `app-textarea`; `MonthCalendar` → `month-calendar`. */
function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Serve the built demo from disk by intercepting requests — no network server,
 * so the renderer runs even when the host's disk/tmpfs is too full to bind a
 * listener. The app is a single-page demo with no router: every URL falls to
 * index.html, and static assets are read from `dist-demo/`.
 */
function serveFromDisk(context, root) {
  const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
    ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" };
  return context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    let file = join(root, normalize(url.pathname).replace(/^\//, "").replace(/^\.\.(\/|$)/, ""));
    try {
      if (statSync(file).isDirectory()) file = join(file, "index.html");
    } catch {
      file = join(root, "index.html");
    }
    try {
      route.fulfill({ status: 200, body: readFileSync(file), contentType: TYPES[extname(file)] || "application/octet-stream" });
    } catch {
      route.fulfill({ status: 404, body: "not found" });
    }
  });
}

/** Read the catalogue manifest the playground publishes (id/width per demo). */
async function readManifest(page) {
  await page.goto(`${BASE}/`, { timeout: 60000 });
  const manifest = await page.evaluate(() => window.__CATALOGUE_MANIFEST__ ?? null);
  if (!manifest) throw new Error("playground did not publish __CATALOGUE_MANIFEST__");
  return manifest;
}

/**
 * Measure the painted box of a demo, including teleported overlays.
 *
 * The demo root can be narrower/shorter than the layout width, and overlay
 * panels (dialog, drawer, popover, toast) live on `<body>` as fixed elements —
 * so "what the component actually draws" is the union of the demo root's
 * descendants and any fixed/absolute body-level panels. Cropping to that union
 * is what removes the dead space the fixed 520×640 box used to ship.
 */
async function measureContent(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const root = document.getElementById("component-shot");
    const demo = root?.querySelector(".cat-demo");
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    const add = (rect) => {
      if (!rect || (rect.width < 1 && rect.height < 1)) return;
      l = Math.min(l, rect.left); t = Math.min(t, rect.top);
      r = Math.max(r, rect.right); b = Math.max(b, rect.bottom);
    };
    /** A layer that spans (nearly) the viewport is a scrim/backdrop: measure its
     *  visible panels instead, so an overlay crops to the dialog, not the screen. */
    const addLayer = (el, depth = 0) => {
      const rect = el.getBoundingClientRect();
      const fullBleed = rect.width >= vw * 0.9 && rect.height >= vh * 0.9;
      if (fullBleed && depth < 3) {
        let any = false;
        for (const child of el.children) {
          const cs = getComputedStyle(child);
          if (cs.display === "none" || cs.visibility === "hidden") continue;
          const cr = child.getBoundingClientRect();
          // The scrim's own tint is not a panel; skip full-bleed children too.
          if (cr.width >= vw * 0.9 && cr.height >= vh * 0.9) { any = addLayer(child, depth + 1) || any; continue; }
          if (cr.width < 1 && cr.height < 1) continue;
          add(cr);
          any = true;
        }
        return any;
      }
      add(rect);
      return true;
    };
    for (const el of demo?.children ?? []) {
      if (getComputedStyle(el).position === "fixed") continue;
      add(el.getBoundingClientRect());
    }
    /* Only true overlay layers count. The Vue mount root (#app) and other
     * static wrappers are block boxes spanning the viewport — unioning them
     * would stretch every crop to the full page width. A layer qualifies when
     * it (or a descendant) is fixed/absolute-positioned, i.e. it paints OUTSIDE
     * the normal flow, which is exactly what a teleported panel does. */
    const isOverlayLayer = (el) => {
      if (el.contains(root)) return false;
      const positioned = (node) => {
        const pos = getComputedStyle(node).position;
        return pos === "fixed" || pos === "absolute";
      };
      if (positioned(el)) return true;
      return [...el.querySelectorAll("*")].some(positioned);
    };
    for (const el of document.body.children) {
      if (el.tagName === "SCRIPT" || el.tagName === "STYLE" || el.id === "component-shot") continue;
      if (el.contains(root)) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) continue;
      if (!isOverlayLayer(el)) continue;
      addLayer(el);
    }
    if (!Number.isFinite(l)) {
      const rr = root.getBoundingClientRect();
      return { x: rr.left, y: rr.top, width: rr.width, height: rr.height };
    }
    const pad = 10;
    return {
      x: Math.max(0, l - pad),
      y: Math.max(0, t - pad),
      width: Math.min(vw, r - l + pad * 2),
      height: Math.min(vh, b - t + pad * 2),
    };
  });
}

/**
 * Render one component: six page loads (one per theme) → crop each to its
 * painted content → 3×2 composite → WebP.
 *
 * One load per theme is mandatory, not a convenience: the theme lives on
 * <html> because overlay panels teleport to <body>, so a data-theme island
 * would leave a dialog/popper in the page theme (docs/per-component-rendering.md
 * §2). Each crop is content-sized, so a badge demo is a few hundred px tall
 * instead of a mostly-empty 640 px panel.
 */
async function renderComponent(page, entry) {
  const width = entry.shot ?? (entry.wide ? 780 : 520);
  /* Centred modals/drawers are positioned against the viewport, so a tall
   * viewport opens a gap between the trigger and the panel that the content
   * crop faithfully includes. Overlay demos therefore get a viewport just tall
   * enough for the panel: the crop stays tight instead of spanning ~400 px of
   * empty backdrop. `overlay` is declared per entry in catalogue-meta.json. */
  await page.setViewportSize({ width: width + 64, height: entry.overlay ? 460 : 1000 });
  const shots = [];
  for (const theme of CATALOGUE_THEMES) {
    // Pointer state persists across navigations: reset before every goto so no
    // frame inherits the previous shot's :hover (visual-harness invariant #2).
    await page.mouse.move(0, 0);
    await page.goto(`${BASE}/?print=component&id=${entry.id}&theme=${theme}`, { timeout: 60000 });
    const loc = page.locator("#component-shot");
    await loc.waitFor({ state: "attached", timeout: 15000 });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(120); // reduced-motion zeroes --dur-*, let layout settle
    const clip = await measureContent(page);
    shots.push({
      buf: await page.screenshot({ clip, animations: "disabled" }),
      w: Math.round(clip.width),
      h: Math.round(clip.height),
    });
  }
  return composeComposite(page, entry, shots);
}

/**
 * Stitch the six crops into one 3-column × 2-row image (dark row over light row)
 * and encode WebP in the page we already have open — no ImageMagick dependency,
 * and the browser's encoder is the same one GitHub Pages' consumers decode.
 */
async function composeComposite(page, entry, shots) {
  const b64 = shots.map((b) => b.buf.toString("base64"));
  const encoded = await page.evaluate(
    async ({ imgs, labels, gutter, labelH, dpr, cols }) => {
      const decoded = await Promise.all(
        imgs.map(async (b64) => {
          const img = new Image();
          img.src = "data:image/png;base64," + b64;
          await img.decode();
          return img;
        }),
      );
      const rows = Math.ceil(decoded.length / cols);
      // Per-cell content sizes vary; align each row to its tallest cell and each
      // column to its widest, so the grid stays tidy without stretching any
      // single demo to a global maximum.
      const colW = [];
      const rowH = [];
      decoded.forEach((img, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        colW[c] = Math.max(colW[c] ?? 0, img.naturalWidth);
        rowH[r] = Math.max(rowH[r] ?? 0, img.naturalHeight);
      });
      const totalW = colW.reduce((a, b) => a + b, 0) + (cols + 1) * gutter;
      const totalH = rowH.reduce((a, b) => a + b + labelH, 0) + (rows + 1) * gutter;
      const canvas = document.createElement("canvas");
      canvas.width = totalW;
      canvas.height = totalH;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#101418";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      decoded.forEach((img, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const cx = gutter + colW.slice(0, c).reduce((a, b) => a + b + gutter, 0);
        const cy = gutter + rowH.slice(0, r).reduce((a, b) => a + b + labelH + gutter, 0);
        ctx.fillStyle = "#8b939f";
        ctx.font = `${13 * dpr}px ui-monospace, monospace`;
        ctx.fillText(labels[i], cx, cy + labelH - 10);
        // Centre narrower/shorter content in its cell rather than stretching it.
        ctx.drawImage(
          img,
          cx + Math.round((colW[c] - img.naturalWidth) / 2),
          cy + labelH + Math.round((rowH[r] - img.naturalHeight) / 2),
        );
      });
      return canvas.toDataURL("image/webp", 0.65);
    },
    { imgs: b64, labels: CATALOGUE_THEMES, gutter: GUTTER, labelH: LABEL_H, dpr: 2, cols: 3 },
  );
  const data = encoded.replace(/^data:image\/webp;base64,/, "");
  const buf = Buffer.from(data, "base64");
  const file = join(COMPONENTS_DIR, `${kebab(entry.id)}.webp`);
  writeFileSync(file, buf);
  return { file, bytes: buf.length };
}

async function renderCatalogue(page, onlyIds) {
  const manifest = await readManifest(page);
  mkdirSync(COMPONENTS_DIR, { recursive: true });
  if (onlyIds?.length) {
    const byId = new Set(onlyIds);
    return manifest.filter((e) => byId.has(e.id));
  }
  // Persist the roster so scripts/catalogue-readme.mjs can build the README
  // tables without importing .vue files (it cannot, outside Vite).
  writeFileSync(
    join(ROOT, "docs", "catalogue-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  return manifest;
}

async function main() {
  const only = process.argv[2] ?? "all";
  if (!["all", "banner", "catalogue"].includes(only)) {
    console.error(`unknown target "${only}" — use: banner | catalogue | (nothing = all)`);
    process.exit(1);
  }
  // --components=<Id1,Id2> restricts tier 2 to those demos (dev/iteration only)
  const onlyIds = process.argv
    .find((a) => a.startsWith("--components="))
    ?.split("=")[1]
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // --dist=<path> points at an already-built dist-demo (skips the bundler;
  // handy when the box cannot afford vite-build plus Chromium simultaneously).
  const externalDist = process.argv.find((a) => a.startsWith("--dist="))?.split("=")[1];

  if (externalDist) {
    console.log(`▶ using pre-built demo at ${externalDist} (skipping build)`);
  } else {
    console.log("▶ building playground demo (vite build → dist-demo)…");
    await run("npx", ["vite", "build", "--config", "vite.demo.config.ts"]);
  }

  let browser;
  try {
    mkdirSync(ASSETS, { recursive: true });

    browser = await chromium.launch();
    /* Tier 1 wants a wide DPR-2 canvas; tier 2 crops to content and gets its own
     * tight context so a single demo never allocates a banner-sized surface
     * (the renderer runs on memory-constrained machines). Both contexts serve
     * the built demo from disk via request interception — no network listener. */
    const bannerContext = await browser.newContext({
      viewport: { width: BANNER_WIDTH, height: 1000 },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });
    await serveFromDisk(bannerContext, externalDist ? externalDist : join(ROOT, "dist-demo"));
    const page = await bannerContext.newPage();
    if (only !== "catalogue") {
      console.log("▶ tier 1: theme banner…");
      await renderBanner(page);
    }
    if (only !== "banner") {
      console.log("▶ tier 2: per-component catalogue (6 themes, 2×3 composite)…");
      await bannerContext.close();
      const catContext = await browser.newContext({
        viewport: { width: 900, height: 1000 },
        deviceScaleFactor: 2,
        reducedMotion: "reduce",
      });
      await serveFromDisk(catContext, externalDist ? externalDist : join(ROOT, "dist-demo"));
      const catPage = await catContext.newPage();
      const list = await renderCatalogue(catPage, onlyIds);
      let total = 0;
      for (const [i, entry] of list.entries()) {
        const out = await renderComponent(catPage, entry);
        total += out.bytes;
        if ((i + 1) % 10 === 0 || i === list.length - 1) console.log(`  ${i + 1}/${list.length} components rendered`);
      }
      console.log(`  ${list.length} composites → docs/assets/components/ (${(total / 1e6).toFixed(1)} MB, 6 themes each)`);
    }
    await browser.close();
    browser = undefined;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  const files = readdirSync(ASSETS)
    .filter((f) => f.endsWith(".png"))
    .map((f) => [f, statSync(join(ASSETS, f)).size])
    .sort((a, b) => a[0].localeCompare(b[0]));
  console.log(`\n✓ ${files.length} images in docs/assets/:`);
  for (const [f, size] of files) console.log(`  ${f}  ${(size / 1024).toFixed(0)} kB`);

  const comps = existsSync(COMPONENTS_DIR)
    ? readdirSync(COMPONENTS_DIR).filter((f) => f.endsWith(".webp"))
    : [];
  const compBytes = comps.reduce((n, f) => n + statSync(join(COMPONENTS_DIR, f)).size, 0);
  console.log(
    `✓ ${comps.length} component composites in docs/assets/components/ (${(compBytes / 1e6).toFixed(1)} MB)`,
  );
}

main().catch((e) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
