#!/usr/bin/env node
/**
 * Objective defect probes for the component demos — the checks a vision model
 * is bad at: exact contrast ratios, element overflow, and clipped text.
 *
 * Runs each demo in a real browser (light + dark) and reports:
 *   - text whose rendered contrast against its own background is below AA,
 *   - elements wider/taller than their scroll container (clipped content),
 *   - text nodes truncated by overflow with no ellipsis,
 *   - images that failed to load or have no intrinsic size.
 *
 * Usage: node scripts/probe-demos.mjs [--only=Id1,Id2]
 */
import { readFileSync, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { chromium } from "playwright";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist-demo");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp" };
const PLACEHOLDER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAFElEQVR42mP8z8AARMAgYJyKAAAAAAElFTkSuQmCC",
  "base64",
);

const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1]?.split(",");

function serve(ctx) {
  return ctx.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname.endsWith("picsum.photos")) {
      route.fulfill({ status: 200, contentType: "image/png", body: PLACEHOLDER });
      return;
    }
    let file = join(DIST, normalize(url.pathname).replace(/^\//, "").replace(/^\.\.(\/|$)/, ""));
    try {
      if (statSync(file).isDirectory()) file = join(file, "index.html");
    } catch {
      file = join(DIST, "index.html");
    }
    try {
      route.fulfill({ status: 200, body: readFileSync(file), contentType: TYPES[extname(file)] || "application/octet-stream" });
    } catch {
      route.fulfill({ status: 404, body: "" });
    }
  });
}

/** WCAG relative luminance from an rgb()/rgba() string. */
function luminance(css) {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(",").map((v) => parseFloat(v));
  if (a === 0) return null;
  const ch = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function ratio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  if (a === null || b === null) return null;
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 1 });
await serve(ctx);
const page = await ctx.newPage();
await page.goto("http://demo.local/", { waitUntil: "load" });
const manifest = await page.evaluate(() => window.__CATALOGUE_MANIFEST__ ?? []);
await browser.close();

const targets = only ? manifest.filter((e) => only.includes(e.id)) : manifest;
const findings = [];

const browser2 = await chromium.launch();
const ctx2 = await browser2.newContext({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 1 });
await serve(ctx2);
const p2 = await ctx2.newPage();

for (const entry of targets) {
  const w = entry.shot ?? (entry.wide ? 780 : 520);
  await p2.setViewportSize({ width: w + 64, height: entry.overlay ? 460 : 1000 });
  for (const theme of ["light", "dark"]) {
    await p2.goto(`http://demo.local/?print=component&id=${entry.id}&theme=${theme}`, { timeout: 60000 });
    await p2.waitForTimeout(150);
    const problems = await p2.evaluate(
      ({ lumSrc }) => {
        const lum = new Function("css", lumSrc);
        const contrast = (fg, bg) => {
          const a = lum(fg), b = lum(bg);
          if (a === null || b === null) return null;
          const [hi, lo] = a >= b ? [a, b] : [b, a];
          return (hi + 0.05) / (lo + 0.05);
        };
        const out = { lowContrast: [], clipped: [], brokenImages: [], overflow: [] };
        const visible = (el) => {
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none") return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        };
        const root = document.getElementById("component-shot") ?? document.body;

        // Effective background: walk up until a non-transparent colour.
        const bgOf = (el) => {
          let node = el;
          while (node && node !== document.documentElement) {
            const cs = getComputedStyle(node);
            const bg = cs.backgroundColor;
            if (bg && !/rgba\([^)]*,\s*0\s*\)/.test(bg) && bg !== "transparent") return bg;
            node = node.parentElement;
          }
          return getComputedStyle(document.body).backgroundColor || "rgb(255,255,255)";
        };

        // 1. text contrast
        for (const el of root.querySelectorAll("*")) {
          if (!visible(el)) continue;
          const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ");
          if (!text) continue;
          const cs = getComputedStyle(el);
          const size = parseFloat(cs.fontSize);
          const bold = Number(cs.fontWeight) >= 600;
          const r = contrast(cs.color, bgOf(el));
          if (r === null) continue;
          const large = size >= 18.66 || (bold && size >= 14);
          const min = large ? 3 : 4.5;
          if (r < min) out.lowContrast.push(`${el.className || el.tagName}: "${text.slice(0, 30)}" ${r.toFixed(2)}:1 (min ${min})`);
        }

        // 2. clipped content inside a scroll/overflow container
        for (const el of root.querySelectorAll("*")) {
          if (!visible(el)) continue;
          const cs = getComputedStyle(el);
          const hidesX = cs.overflowX !== "visible";
          const hidesY = cs.overflowY !== "visible";
          if (!hidesX && !hidesY) continue;
          // Deliberately hidden native controls (0-size proxies) are not defects.
          if (el.clientWidth <= 4 && el.clientHeight <= 4) continue;
          // An ellipsis is intentional truncation, and `overflow: auto|scroll` is a
          // scroll region, not clipped content. Only silent clipping counts.
          const ellipsis = cs.textOverflow === "ellipsis";
          const scrolls = cs.overflowY === "auto" || cs.overflowY === "scroll"
            || cs.overflowX === "auto" || cs.overflowX === "scroll";
          // A track that is deliberately translated (carousel/board panes) is a
          // slider, not clipped content.
          // Sliding tracks keep their slides side by side and move them with a
          // transform (carousel) — that is a slider, not clipped content. The
          // class check covers the moment before the transform is applied.
          const slider =
            /carousel|track/.test(String(el.className)) ||
            [...el.querySelectorAll("*")].some((c) => /translate[XYZ3d]*\(/.test(getComputedStyle(c).transform));
          if (slider) continue;
          if (hidesX && !ellipsis && !scrolls && el.scrollWidth > el.clientWidth + 2) {
            out.clipped.push(`${el.className || el.tagName}: content ${el.scrollWidth}px in ${el.clientWidth}px box`);
          }
          if (hidesY && !scrolls && el.scrollHeight > el.clientHeight + 2) {
            out.clipped.push(`${el.className || el.tagName}: content ${el.scrollHeight}px in ${el.clientHeight}px box (vertical)`);
          }
        }

        // 3. images
        for (const img of root.querySelectorAll("img")) {
          if (!img.complete || img.naturalWidth === 0) {
            out.brokenImages.push(`${img.className || "img"} src=${(img.getAttribute("src") ?? "").slice(0, 40)}`);
            continue;
          }
          const r = img.getBoundingClientRect();
          const parent = img.parentElement?.getBoundingClientRect();
          if (parent && (r.width > parent.width + 1 || r.height > parent.height + 1)) {
            out.overflow.push(`img ${Math.round(r.width)}x${Math.round(r.height)} in ${Math.round(parent.width)}x${Math.round(parent.height)}`);
          }
        }
        return out;
      },
      { lumSrc: luminance.toString() },
    );
    const total = problems.lowContrast.length + problems.clipped.length + problems.brokenImages.length + problems.overflow.length;
    if (total) findings.push({ id: entry.id, theme, ...problems });
  }
}

await browser2.close();

let n = 0;
for (const f of findings) {
  console.log(`\n${f.id} @ ${f.theme}`);
  for (const k of ["lowContrast", "clipped", "brokenImages", "overflow"]) {
    for (const item of f[k]) { console.log(`  [${k}] ${item}`); n++; }
  }
}
console.log(`\n${findings.length} component/theme pairs with findings, ${n} total findings`);
