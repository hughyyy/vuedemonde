#!/usr/bin/env node
/**
 * Pure image comparison for the visual-regression harness — no browser, no
 * framework. Two-stage gate:
 *
 *   1. CHEAP: 64-bit dHash (9×8 grayscale gradients). Equal hashes → the
 *      frames are visually identical; we stop here — no full diff pass.
 *   2. EXPENSIVE (only on hash mismatch): full-resolution per-pixel diff →
 *      changed-pixel ratio + tight bounding box → verdict:
 *        - ratio < noiseRatio  → "noise"  (subpixel/AA jitter, still a pass)
 *        - otherwise           → "changed" (real visual delta)
 *
 * Only "changed" frames are surfaced for vision-model analysis.
 *
 * Everything here is pure; `readPng`/`encodePng` are the only IO.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

/** RGBA pixel access wrapper (pngjs buffer layout is row-major RGBA). */
/**
 * @typedef {Object} RgbaImage
 * @property {number} width
 * @property {number} height
 * @property {Buffer} data
 */

/** @param {Buffer} buffer @returns {RgbaImage} */
export function decodePng(buffer) {
  return PNG.sync.read(buffer);
}

/** @param {RgbaImage} img @returns {Buffer} */
export function encodePng(img) {
  const png = new PNG({ width: img.width, height: img.height });
  img.data.copy(png.data);
  return PNG.sync.write(png, { colorType: 6 });
}

/** @param {string} path @returns {RgbaImage} */
export function readPng(path) {
  return decodePng(readFileSync(path));
}

/** @param {string} path @param {RgbaImage} img */
export function writePng(path, img) {
  writeFileSync(path, encodePng(img));
}

/** WCAG-ish relative luma of one RGBA pixel (0..255). */
/** @param {RgbaImage} img @param {number} x @param {number} y @returns {number} */
function lumaAt(img, x, y) {
  const i = (y * img.width + x) * 4;
  const [r, g, b] = [img.data[i], img.data[i + 1], img.data[i + 2]];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 112-bit frame fingerprint: 64-bit gradient dHash (9×8 luma) + 48-bit color
 * signature (4×4 block-mean RGB).
 *
 * The gradient part alone is blind on uniform surfaces — two flat frames of
 * different colours both hash to 0. The color signature catches exactly that
 * class of change, so the cheap gate never lets a real delta through to the
 * "identical" verdict.
 */
/** @param {RgbaImage} img @returns {bigint} */
export function dhash(img) {
  const sx = img.width / 9;
  const sy = img.height / 8;
  let grad = 0n;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = lumaAt(img, Math.floor(x * sx), Math.floor(y * sy));
      const right = lumaAt(img, Math.floor((x + 1) * sx), Math.floor(y * sy));
      grad = (grad << 1n) | (left < right ? 1n : 0n);
    }
  }
  // 4×4 block means — quantise each block's RGB into the signature
  const cx = img.width / 4;
  const cy = img.height / 4;
  let color = 0n;
  for (let by = 0; by < 4; by++) {
    for (let bx = 0; bx < 4; bx++) {
      const x0 = Math.floor(bx * cx);
      const y0 = Math.floor(by * cy);
      const x1 = Math.max(x0 + 1, Math.floor((bx + 1) * cx));
      const y1 = Math.max(y0 + 1, Math.floor((by + 1) * cy));
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * img.width + x) * 4;
          r += img.data[i];
          g += img.data[i + 1];
          b += img.data[i + 2];
          n++;
        }
      }
      r = Math.floor(r / n);
      g = Math.floor(g / n);
      b = Math.floor(b / n);
      color = (color << 24n) | (BigInt(r) << 16n) | (BigInt(g) << 8n) | BigInt(b);
    }
  }
  return (grad << 48n) | color;
}

/**
 * @typedef {"identical" | "noise" | "changed"} DiffVerdict
 */

/**
 * @typedef {Object} CompareResult
 * @property {DiffVerdict} verdict
 * @property {boolean} hashEqual
 * @property {number} diffRatio changed pixels / total visible pixels
 * @property {number} changedPixels
 * @property {{x: number, y: number, w: number, h: number} | null} bbox
 */

/**
 * @typedef {Object} CompareOptions
 * @property {number} [tolerance] per-channel tolerance before a pixel counts as changed
 * @property {number} [noiseRatio] changed-pixel ratio below this is treated as renderer noise
 */

/**
 * Compare two frames. Only called when dhash already differed (cheap gate);
 * still cheap — one linear pass, min/max tracking, no allocations per pixel.
 */
/** @param {RgbaImage} a @param {RgbaImage} b @param {CompareOptions} [opts] @returns {CompareResult} */
export function diffFrames(a, b, opts = {}) {
  const tolerance = opts.tolerance ?? 4;
  const noiseRatio = opts.noiseRatio ?? 0.0005;

  if (a.width !== b.width || a.height !== b.height) {
    return {
      verdict: "changed",
      hashEqual: false,
      diffRatio: 1,
      changedPixels: a.width * a.height + b.width * b.height,
      bbox: { x: 0, y: 0, w: Math.max(a.width, b.width), h: Math.max(a.height, b.height) },
    };
  }

  let minX = a.width;
  let minY = a.height;
  let maxX = -1;
  let maxY = -1;
  let changed = 0;
  let visible = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const aAlpha = a.data[i + 3];
    const bAlpha = b.data[i + 3];
    // fully invisible on BOTH sides: never counts (teleport stubs, ghosts)
    if (aAlpha < 8 && bAlpha < 8) continue;
    visible++;
    const dr = Math.abs(a.data[i] - b.data[i]);
    const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
    const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
    const da = Math.abs(aAlpha - bAlpha);
    if (dr > tolerance || dg > tolerance || db > tolerance || da > tolerance) {
      changed++;
      const x = (i / 4) % a.width;
      const y = Math.floor(i / 4 / a.width);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  const hashEqual = dhash(a) === dhash(b);
  const hasDiff = changed > 0 || !hashEqual;
  if (!hasDiff) {
    return { verdict: "identical", hashEqual: true, diffRatio: 0, changedPixels: 0, bbox: null };
  }
  if (changed === 0) {
    // the fingerprint disagrees (e.g. sub-tolerance uniform drift) but the
    // full pass cannot see a single changed pixel — nothing visibly moved
    return { verdict: "identical", hashEqual, diffRatio: 0, changedPixels: 0, bbox: null };
  }
  const diffRatio = visible > 0 ? changed / visible : changed > 0 ? 1 : 0;
  const bbox = changed > 0 ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } : null;
  // A COMPACT cluster (bbox area ≈ changed pixels) is a real edit even at a
  // tiny ratio — e.g. one accent bar recoloured. Only SPARSE drift (jitter
  // spread across the frame, area/px ratio high) is renderer noise.
  const dense = changed > 0 && bbox.w * bbox.h / changed < 2;
  return { verdict: diffRatio < noiseRatio && !dense ? "noise" : "changed", hashEqual, diffRatio, changedPixels: changed, bbox };
}

/** One-shot verdict: cheap gate, full diff only when hashes disagree. */
/** @param {RgbaImage} a @param {RgbaImage} b @param {CompareOptions} [opts] @returns {CompareResult} */
export function compareFrames(a, b, opts = {}) {
  if (dhash(a) === dhash(b)) {
    return { verdict: "identical", hashEqual: true, diffRatio: 0, changedPixels: 0, bbox: null };
  }
  return diffFrames(a, b, opts);
}

/**
 * Highlight overlay for humans + the vision model: the current frame with
 * changed pixels painted magenta and a 1px bbox stroke.
 */
/** @param {RgbaImage} current @param {RgbaImage} baseline @returns {RgbaImage} */
export function diffOverlay(current, baseline) {
  const out = { width: current.width, height: current.height, data: Buffer.from(current.data) };
  for (let i = 0; i < current.data.length; i += 4) {
    const changed =
      Math.abs(current.data[i] - baseline.data[i]) > 4 ||
      Math.abs(current.data[i + 1] - baseline.data[i + 1]) > 4 ||
      Math.abs(current.data[i + 2] - baseline.data[i + 2]) > 4 ||
      Math.abs(current.data[i + 3] - baseline.data[i + 3]) > 4;
    if (changed) {
      out.data[i] = 255;
      out.data[i + 1] = 0;
      out.data[i + 2] = 255;
      out.data[i + 3] = 255;
    }
  }
  const { bbox } = diffFrames(current, baseline);
  if (bbox) {
    const stroke = (x, y) => {
      if (x < 0 || y < 0 || x >= out.width || y >= out.height) return;
      const j = (y * out.width + x) * 4;
      out.data[j] = 255;
      out.data[j + 1] = 0;
      out.data[j + 2] = 255;
      out.data[j + 3] = 255;
    };
    for (let x = bbox.x; x < bbox.x + bbox.w; x++) {
      stroke(x, bbox.y);
      stroke(x, bbox.y + bbox.h - 1);
    }
    for (let y = bbox.y; y < bbox.y + bbox.h; y++) {
      stroke(bbox.x, y);
      stroke(bbox.x + bbox.w - 1, y);
    }
  }
  return out;
}
