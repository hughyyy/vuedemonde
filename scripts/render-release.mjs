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
 *   ?print=banner                           → theme islands, 2 rows of 8 cards
 *   ?print=family&id=<id>&theme=<theme>     → one family section, theme applied
 * Outputs are committed under docs/assets/ and referenced by README.md.
 *
 * Reproducibility: fixed viewport, deviceScaleFactor 2 (retina-crisp),
 * prefers-reduced-motion emulated (the kit zeroes every --dur-* under it), so
 * image diffs across releases show only real visual changes. Exception: the
 * calendar section seeds around the *current* date, so its grid shifts monthly
 * by design.
 */
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const ROOT = new URL("..", import.meta.url).pathname;
const ASSETS = join(ROOT, "docs", "assets");
const PORT = 5277;
const BASE = `http://127.0.0.1:${PORT}`;

const FAMILIES = [
  "primitives",
  "inputs",
  "overlays",
  "navigation",
  "data",
  "layout",
  "charts",
  "calendar",
  "board",
];
const THEMES = ["light", "dark", "thermal"];

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
  await page.goto(`${BASE}/?print=banner`);
  await shot(page, "#banner", join(ASSETS, "theme-banner.png"));
  console.log("  banner → theme-banner.png (two rows of 8 theme cards, light themes grouped)");
}

async function renderCatalogue(page) {
  for (const id of FAMILIES) {
    for (const theme of THEMES) {
      await page.goto(`${BASE}/?print=family&id=${id}&theme=${theme}`);
      await shot(page, "#print-section", join(ASSETS, `catalogue-${id}-${theme}.png`));
    }
    console.log(`  ${id} → 3 themes rendered`);
  }
}

async function main() {
  const only = process.argv[2] ?? "all";
  if (!["all", "banner", "catalogue"].includes(only)) {
    console.error(`unknown target "${only}" — use: banner | catalogue | (nothing = all)`);
    process.exit(1);
  }

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
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });

    const page = await context.newPage();
    if (only !== "catalogue") {
      console.log("▶ tier 1: theme banner…");
      await renderBanner(page);
    }
    if (only !== "banner") {
      console.log("▶ tier 2: per-family catalogue (light / dark / thermal)…");
      await renderCatalogue(page);
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
}

main().catch((e) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
