/** Type surface for scripts/visual-compare.mjs (the harness comparator). */
export type RgbaImage = { width: number; height: number; data: Buffer };
export type DiffVerdict = "identical" | "noise" | "changed";
export type CompareResult = {
  verdict: DiffVerdict;
  hashEqual: boolean;
  diffRatio: number;
  changedPixels: number;
  bbox: { x: number; y: number; w: number; h: number } | null;
};
export type CompareOptions = {
  tolerance?: number;
  noiseRatio?: number;
};

export function decodePng(buffer: Buffer): RgbaImage;
export function encodePng(img: RgbaImage): Buffer;
export function readPng(path: string): RgbaImage;
export function writePng(path: string, img: RgbaImage): void;
export function dhash(img: RgbaImage): bigint;
export function diffFrames(a: RgbaImage, b: RgbaImage, opts?: CompareOptions): CompareResult;
export function compareFrames(a: RgbaImage, b: RgbaImage, opts?: CompareOptions): CompareResult;
export function diffOverlay(current: RgbaImage, baseline: RgbaImage): RgbaImage;
