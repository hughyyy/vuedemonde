/** Shared chart helpers + default palette (pure, dependency-free SVG). */

export const CHART_COLORS = ["#4f9cf9", "#f97316", "#10b981", "#e11d48", "#f59e0b", "#0ea5e9"];

/** Round up to a "nice" axis max (1/2/5 × 10^n). */
export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const f = v / base;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * base;
}

export function fmtTick(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v);
}

export type ChartMargins = { top: number; right: number; bottom: number; left: number };
