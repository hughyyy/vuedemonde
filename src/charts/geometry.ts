/**
 * Shared timeseries geometry — pure functions, so the drawing rules are
 * testable without a DOM (ported from the mocklogs observability console).
 *
 * The rules that matter and are easy to get wrong:
 * - **`null` is a gap, not a zero.** A missing bucket must break the line;
 *   drawing it at 0 would invent a dip the source never reported.
 * - **A flat series still gets a band.** When min == max the range is opened
 *   around the value rather than dividing by zero.
 * - **Thresholds participate in the range.** A monitor's critical line must be
 *   visible even when every point sits far below it.
 */

export type ChartPoint = number | null;

export interface GraphSeries {
  name: string;
  points: ChartPoint[];
  color?: string;
}

export interface ValueRange {
  min: number;
  max: number;
  empty: boolean;
}

export interface Scale {
  x: (index: number) => number;
  y: (value: number) => number;
  ticks: number[];
}

export interface GraphBox {
  width: number;
  height: number;
  padTop: number;
  padRight: number;
  padBottom: number;
  padLeft: number;
}

export const DEFAULT_BOX: GraphBox = { width: 720, height: 220, padTop: 8, padRight: 12, padBottom: 22, padLeft: 52 };

/** The y domain: every finite point plus every threshold, opened up when it is degenerate. */
export function valueRange(series: GraphSeries[], thresholds: number[] = []): ValueRange {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const line of series) {
    for (const point of line.points) {
      if (point === null || !Number.isFinite(point)) continue;
      if (point < min) min = point;
      if (point > max) max = point;
    }
  }
  for (const t of thresholds) {
    if (!Number.isFinite(t)) continue;
    if (t < min) min = t;
    if (t > max) max = t;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1, empty: true };
  if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1;
    return { min: min - pad, max: max + pad, empty: false };
  }
  // Include 0 in the domain only when the series actually reaches near it, so a counter that
  // lives between 800 and 900 is not flattened against an inert zero baseline.
  const pad = (max - min) * 0.08;
  return { min: min - pad, max: max + pad, empty: false };
}

/** Axis ticks: "nice" steps (1/2/5 × 10ⁿ) so the labels read as numbers, not as raw divisors. */
export function ticksFor(min: number, max: number, count = 4): number[] {
  const span = max - min;
  if (!Number.isFinite(span) || span <= 0) return [min];
  const rough = span / Math.max(1, count);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  const step = (normalised >= 5 ? 10 : normalised >= 2 ? 5 : normalised >= 1 ? 2 : 1) * magnitude;
  const first = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = first; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks.length ? ticks : [min];
}

/** Pixel scales for the plot area inside `box`. */
export function scaleOf(box: GraphBox, count: number, range: ValueRange): Scale {
  const innerWidth = Math.max(1, box.width - box.padLeft - box.padRight);
  const innerHeight = Math.max(1, box.height - box.padTop - box.padBottom);
  const span = range.max - range.min || 1;
  return {
    x: (index: number) => box.padLeft + (count <= 1 ? 0 : (index / (count - 1)) * innerWidth),
    y: (value: number) => box.padTop + innerHeight - ((value - range.min) / span) * innerHeight,
    ticks: ticksFor(range.min, range.max),
  };
}

/** An SVG path for one series, broken at every gap. */
export function pathOf(points: ChartPoint[], scale: Scale): string {
  let path = "";
  let drawing = false;
  points.forEach((point, index) => {
    if (point === null || !Number.isFinite(point)) {
      drawing = false;
      return;
    }
    const x = scale.x(index).toFixed(2);
    const y = scale.y(point).toFixed(2);
    path += `${drawing ? "L" : "M"}${x} ${y}`;
    drawing = true;
  });
  return path;
}

/** Index of the point nearest a pixel position — the hover crosshair's readout. */
export function nearestIndex(x: number, box: GraphBox, count: number): number {
  if (count <= 1) return 0;
  const innerWidth = Math.max(1, box.width - box.padLeft - box.padRight);
  const ratio = (x - box.padLeft) / innerWidth;
  const index = Math.round(ratio * (count - 1));
  return Math.min(count - 1, Math.max(0, index));
}
