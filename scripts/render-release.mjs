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
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { CATALOGUE_THEMES as CATALOGUE_THEME_LIST } from "./catalogue-themes.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const ASSETS = join(ROOT, "docs", "assets");
const PORT = 5277;
/** Banner page width: 12 cards + 11 gaps + padding, so two rows of 12 fit. */
const BANNER_WIDTH = 2120;
const BASE = `http://127.0.0.1:${PORT}`;


function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    p.stderr?.on("data", (d) => (err += d));
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} failed (${code}): ${err.slice(0, 400)}`))));
    p.on("error", reject);
  });
}

async function waitForServer(url, tries = 60) {
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
  await page.goto(`${BASE}/?print=banner`);
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

/** Read the catalogue manifest the playground publishes (id/width per demo). */
async function readManifest(page) {
  await page.goto(`${BASE}/`);
  const manifest = await page.evaluate(() => window.__CATALOGUE_MANIFEST__ ?? null);
  if (!manifest) throw new Error("playground did not publish __CATALOGUE_MANIFEST__");
  return manifest;
}

/**
 * Render one component: six page loads (one per theme) → 2×3 composite → WebP.
 *
 * One load per theme is mandatory, not a convenience: the theme lives on
 * <html> because overlay panels teleport to <body>, so a data-theme island
 * would leave a dialog/popper in the page theme (docs/per-component-rendering.md
 * §2). Each crop is element-screenshotted at DPR 2, so cells match exactly.
 */
async function renderComponent(page, entry) {
  const width = entry.shot ?? (entry.wide ? 780 : 520);
  await page.setViewportSize({ width: width + 64, height: 900 });
  const shots = [];
  for (const theme of CATALOGUE_THEMES) {
    // Pointer state persists across navigations: reset before every goto so no
    // frame inherits the previous shot's :hover (visual-harness invariant #2).
    await page.mouse.move(0, 0);
    await page.goto(`${BASE}/?print=component&id=${entry.id}&theme=${theme}`);
    const loc = page.locator("#component-shot");
    await loc.waitFor({ state: "attached", timeout: 15000 });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(120); // reduced-motion zeroes --dur-*, let layout settle
    shots.push(await loc.screenshot());
  }
  return composeComposite(page, entry, shots);
}

/**
 * Stitch the six crops into one 3-column × 2-row image (dark row over light row)
 * and encode WebP in the page we already have open — no ImageMagick dependency,
 * and the browser's encoder is the same one GitHub Pages' consumers decode.
 */
async function composeComposite(page, entry, shots) {
  const b64 = shots.map((b) => b.toString("base64"));
  const encoded = await page.evaluate(
    async ({ imgs, labels, gutter, labelH, dpr }) => {
      const decoded = await Promise.all(
        imgs.map(async (b64) => {
          const img = new Image();
          img.src = "data:image/png;base64," + b64;
          await img.decode();
          return img;
        }),
      );
      const cols = 3;
      const rows = Math.ceil(decoded.length / cols);
      const cellW = Math.max(...decoded.map((i) => i.naturalWidth));
      const cellH = Math.max(...decoded.map((i) => i.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = cols * cellW + (cols + 1) * gutter;
      canvas.height = rows * (cellH + labelH) + (rows + 1) * gutter;
      const ctx = canvas.getContext("2d");
      // Neutral backdrop (matches the kit's dark default) so mixed-polarity
      // cells do not bleed into each other visually.
      ctx.fillStyle = "#101418";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      decoded.forEach((img, i) => {
        const cx = gutter + (i % cols) * (cellW + gutter);
        const cy = gutter + Math.floor(i / cols) * (cellH + labelH + gutter);
        ctx.fillStyle = "#8b939f";
        ctx.font = `${13 * dpr}px ui-monospace, monospace`;
        ctx.fillText(labels[i], cx, cy + labelH - 10);
        ctx.drawImage(img, cx, cy + labelH);
      });
      return canvas.toDataURL("image/webp", 0.65);
    },
    { imgs: b64, labels: CATALOGUE_THEMES, gutter: GUTTER, labelH: LABEL_H, dpr: 2 },
  );
  const data = encoded.replace(/^data:image\/webp;base64,/, "");
  const file = join(COMPONENTS_DIR, `${kebab(entry.id)}.webp`);
  writeFileSync(file, Buffer.from(data, "base64"));
  return { file, bytes: Buffer.from(data, "base64").length };
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

  console.log("▶ building playground demo (vite build → dist-demo)…");
  await run("npx", ["vite", "build", "--config", "vite.demo.config.ts"]);

  console.log(`▶ serving demo on :${PORT} (vite preview)…`);
  const preview = spawn("npx", ["vite", "preview", "--config", "vite.demo.config.ts", "--host", "127.0.0.1", "--port", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
  });
  let browser;
  try {
    await waitForServer(`${BASE}/`);
    mkdirSync(ASSETS, { recursive: true });

    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: BANNER_WIDTH, height: 1000 },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });

    const page = await context.newPage();
    if (only !== "catalogue") {
      console.log("▶ tier 1: theme banner…");
      await renderBanner(page);
    }
    if (only !== "banner") {
      console.log("▶ tier 2: per-component catalogue (6 themes, 2×3 composite)…");
      const list = await renderCatalogue(page, onlyIds);
      let total = 0;
      for (const [i, entry] of list.entries()) {
        const out = await renderComponent(page, entry);
        total += out.bytes;
        if ((i + 1) % 10 === 0 || i === list.length - 1) console.log(`  ${i + 1}/${list.length} components rendered`);
      }
      console.log(`  ${list.length} composites → docs/assets/components/ (${(total / 1e6).toFixed(1)} MB, 6 themes each)`);
    }
    await browser.close();
    browser = undefined;
  } finally {
    preview.kill();
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
