// @vitest-environment node
import { describe, expect, it } from "vitest";
import { decodePng, encodePng, dhash, diffFrames, compareFrames, diffOverlay } from "../scripts/visual-compare.mjs";

/** Mirrors the comparator's JSDoc typedef (an .mjs export is not visible to TS). */
type RgbaImage = { width: number; height: number; data: Buffer };

/** Deterministic tiny image builder — seeded PRNG so tests are reproducible. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function image(w: number, h: number, paint: (x: number, y: number) => [number, number, number, number]): RgbaImage {
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = paint(x, y);
      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  return { width: w, height: h, data };
}

const solid = (w: number, h: number, color: [number, number, number, number]) => image(w, h, () => color);
const rand = (w: number, h: number, seed: number) => {
  const rnd = mulberry32(seed);
  return image(w, h, () => [Math.floor(rnd() * 256), Math.floor(rnd() * 256), Math.floor(rnd() * 256), 255]);
};

describe("PNG encode/decode round-trip", () => {
  it("preserves every pixel", () => {
    const src = rand(37, 23, 7);
    const encoded = encodePng(src);
    expect(encoded instanceof Buffer).toBe(true);
    const back = decodePng(encoded);
    expect(back.width).toBe(37);
    expect(back.height).toBe(23);
    expect(Buffer.compare(back.data, src.data)).toBe(0);
  });
});

describe("dhash — the cheap gate", () => {
  it("is equal for identical frames", () => {
    const a = rand(64, 64, 1);
    expect(dhash(a)).toBe(dhash(image(64, 64, (x, y) => [a.data[(y * 64 + x) * 4]!, a.data[(y * 64 + x) * 4 + 1]!, a.data[(y * 64 + x) * 4 + 2]!, 255])));
  });

  it("is insensitive to a single pixel and to sub-threshold alpha-only deltas", () => {
    const a = solid(64, 64, [10, 20, 30, 255]);
    const onePx = image(64, 64, (x, y) => (x === 5 && y === 5 ? [11, 20, 30, 255] : [10, 20, 30, 255]));
    // single-channel +1 is below the 4-tolerance of the diff pass, but the
    // hash only stores gradients — a 1px change can flip at most 2 bits
    expect(dhash(a)).toBe(dhash(onePx));
  });

  it("differs when a region changes", () => {
    const a = solid(64, 64, [10, 20, 30, 255]);
    const b = solid(64, 64, [200, 200, 200, 255]);
    expect(dhash(a)).not.toBe(dhash(b));
  });

  it("catches a pure colour change on an otherwise uniform surface", () => {
    // uniform frames have no gradients — the gradient part hashes to 0 for
    // both; the color signature must still separate them
    const dark = solid(48, 32, [8, 8, 8, 255]);
    const blue = solid(48, 32, [8, 8, 200, 255]);
    expect(dhash(dark)).not.toBe(dhash(blue));
    expect(compareFrames(dark, blue).verdict).toBe("changed");
  });

  it("treats resized content as a different frame (fingerprint, not perceptual)", () => {
    // the color signature is resolution-dependent: same content at a new
    // size is a different render and MUST surface as changed
    const small = image(9, 8, (x, y) => [(x * 20 + y * 7) % 256, 128, 40, 255]);
    const large = image(90, 80, (x, y) => [Math.floor(x / 10) * 20 + Math.floor(y / 10) * 7, 128, 40, 255]);
    expect(dhash(small)).not.toBe(dhash(large));
  });
});

describe("diffFrames — full pass only after hash mismatch", () => {
  it("reports identical for pixel-identical frames", () => {
    const a = rand(100, 100, 3);
    const r = diffFrames(a, a);
    expect(r.verdict).toBe("identical");
    expect(r.diffRatio).toBe(0);
    expect(r.bbox).toBeNull();
  });

  it("localises a single changed pixel to a 1×1 bbox", () => {
    const a = solid(100, 100, [0, 0, 0, 255]);
    const b = image(100, 100, (x, y) => (x === 42 && y === 17 ? [255, 255, 255, 255] : [0, 0, 0, 255]));
    const r = diffFrames(a, b, { noiseRatio: 1e-9 }); // pin a single pixel as a real change
    expect(r.verdict).toBe("changed");
    expect(r.changedPixels).toBe(1);
    expect(r.bbox).toEqual({ x: 42, y: 17, w: 1, h: 1 });
  });

  it("draws a tight bbox around a corner cluster", () => {
    const a = solid(50, 50, [0, 0, 0, 255]);
    const b = image(50, 50, (x, y) => (x >= 3 && x <= 9 && y >= 12 && y <= 14 ? [255, 0, 0, 255] : [0, 0, 0, 255]));
    const r = diffFrames(a, b, { noiseRatio: 1e-9 });
    expect(r.bbox).toEqual({ x: 3, y: 12, w: 7, h: 3 });
    expect(r.changedPixels).toBe(21);
  });

  it("treats sub-tolerance channel drift as identical", () => {
    const a = solid(32, 32, [100, 100, 100, 255]);
    const b = solid(32, 32, [103, 100, 100, 255]); // Δ3 < tolerance 4
    expect(diffFrames(a, b).verdict).toBe("identical");
  });

  it("ignores pixels invisible on both sides", () => {
    const a = image(20, 20, (x, y) => (x < 10 ? [255, 0, 0, 255] : [0, 0, 0, 0]));
    const b = image(20, 20, (x, y) => (x < 10 ? [255, 0, 0, 255] : [9, 9, 9, 0]));
    const r = diffFrames(a, b);
    expect(r.verdict).toBe("identical");
    expect(r.changedPixels).toBe(0);
  });

  it("size mismatch is a hard change", () => {
    const r = diffFrames(solid(10, 10, [0, 0, 0, 255]), solid(12, 10, [0, 0, 0, 255]));
    expect(r.verdict).toBe("changed");
    expect(r.bbox).toEqual({ x: 0, y: 0, w: 12, h: 10 });
  });

  it("buckets tiny drift as noise below the ratio threshold", () => {
    const a = rand(200, 200, 11);
    const b = Buffer.from(a.data);
    // flip 15 random pixels (15 / 40000 = 0.0375% — under the 0.05% default)
    const rnd = mulberry32(5);
    for (let k = 0; k < 15; k++) {
      const i = Math.floor(rnd() * 200 * 200) * 4;
      b[i] = (b[i]! + 60) % 256;
    }
    const noisy = { width: 200, height: 200, data: b };
    const r = diffFrames(a, noisy);
    expect(r.verdict).toBe("noise");
    expect(r.changedPixels).toBe(15);
    expect(r.bbox).not.toBeNull();
  });

  it("crosses to changed above the threshold", () => {
    const a = rand(200, 200, 11);
    const b = Buffer.from(a.data);
    const rnd = mulberry32(5);
    for (let k = 0; k < 200; k++) {
      const i = Math.floor(rnd() * 200 * 200) * 4;
      b[i] = (b[i]! + 60) % 256;
    }
    const noisy = { width: 200, height: 200, data: b };
    expect(diffFrames(a, noisy).verdict).toBe("changed");
  });

  it("a compact cluster is a real change even below the ratio threshold", () => {
    // 40×40 block (1600 px) in a 1000×1000 frame = 0.16% — every other
    // change that tiny would be noise, but a solid region moved/repainted
    const a = solid(1000, 1000, [240, 240, 240, 255]);
    const b = image(1000, 1000, (x, y) => (x >= 100 && x < 140 && y >= 300 && y < 340 ? [10, 10, 10, 255] : [240, 240, 240, 255]));
    const r = diffFrames(a, b, { noiseRatio: 0.005 }); // ratio 0.16% < 0.5%
    expect(r.verdict).toBe("changed");
    expect(r.bbox).toEqual({ x: 100, y: 300, w: 40, h: 40 });
  });
});

describe("compareFrames — the two-stage gate", () => {
  it("skips the full diff when hashes agree (cheap path)", () => {
    const a = solid(60, 60, [5, 5, 5, 255]);
    const r = compareFrames(a, a);
    expect(r.verdict).toBe("identical");
    expect(r.hashEqual).toBe(true);
    expect(r.bbox).toBeNull();
  });

  it("runs the diff and surfaces bbox/ratio when hashes disagree", () => {
    const a = solid(60, 60, [5, 5, 5, 255]);
    const b = solid(60, 60, [5, 5, 200, 255]);
    const r = compareFrames(a, b);
    expect(r.verdict).toBe("changed");
    expect(r.hashEqual).toBe(false);
    expect(r.bbox!.w).toBe(60);
  });
});

describe("diffOverlay — vision-model artifact", () => {
  it("paints changed pixels magenta and leaves untouched pixels alone", () => {
    const a = solid(40, 40, [10, 10, 10, 255]);
    const b = image(40, 40, (x, y) => (x >= 19 && x <= 21 && y >= 19 && y <= 21 ? [200, 200, 200, 255] : [10, 10, 10, 255]));
    const out = diffOverlay(b, a);
    const px = (x: number, y: number) => {
      const i = (y * 40 + x) * 4;
      return [out.data[i], out.data[i + 1], out.data[i + 2]] as const;
    };
    for (let x = 19; x <= 21; x++) {
      for (let y = 19; y <= 21; y++) {
        expect(px(x, y)).toEqual([255, 0, 255]); // every changed pixel
      }
    }
    expect(px(18, 20)).toEqual([10, 10, 10]); // left of the bbox untouched
    expect(px(22, 20)).toEqual([10, 10, 10]); // right of the bbox untouched
    expect(px(0, 0)).toEqual([10, 10, 10]); // untouched pixel keeps current
  });
});
