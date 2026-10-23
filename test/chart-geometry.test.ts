// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import {
  DEFAULT_BOX,
  nearestIndex,
  pathOf,
  scaleOf,
  ticksFor,
  valueRange,
} from "../src/charts/geometry";

const one = (points: (number | null)[]) => [{ name: "s", points }];

describe("valueRange — the y-domain contract", () => {
  it("skips gaps: null and non-finite points never enter the domain", () => {
    const r = valueRange(one([null, 5, Number.NaN, -3, Number.POSITIVE_INFINITY]));
    expect(r.empty).toBe(false);
    expect(r.min).toBeLessThanOrEqual(-3);
    expect(r.max).toBeGreaterThanOrEqual(5);
  });

  it("a flat series still gets a band instead of dividing by zero", () => {
    const r = valueRange(one([42, 42, 42]));
    expect(r.min).toBeLessThan(42);
    expect(r.max).toBeGreaterThan(42);
  });

  it("thresholds participate in the range even when no point reaches them", () => {
    const r = valueRange(one([1, 2, 3]), [50]);
    expect(r.max).toBeGreaterThanOrEqual(50);
  });

  it("an all-gap series is an empty range", () => {
    expect(valueRange(one([null, null]))).toEqual({ min: 0, max: 1, empty: true });
  });
});

describe("ticksFor + scaleOf — axis maths", () => {
  it("produces nice 1/2/5×10ⁿ steps covering the span", () => {
    // expectations verified against the implementation; each output is a
    // multiple of one 1/2/5×10ⁿ step, starts ≥ min and ends ≤ max
    expect(ticksFor(0, 100)).toEqual([0, 50, 100]);
    expect(ticksFor(0, 10)).toEqual([0, 5, 10]);
    expect(ticksFor(0, 1.2)).toEqual([0, 0.5, 1]);
    expect(ticksFor(3, 9)).toEqual([4, 6, 8]);
    expect(ticksFor(800, 900)).toEqual([800, 850, 900]);
    expect(ticksFor(-5, 5)).toEqual([-5, 0, 5]);
  });

  it("scale y-maps domain to plot pixels (inverted) and x maps indexes", () => {
    const scale = scaleOf(DEFAULT_BOX, 5, { min: 0, max: 100, empty: false });
    expect(scale.y(100)).toBeLessThan(scale.y(0));
    expect(scale.x(4)).toBeGreaterThan(scale.x(0));
  });

  it("nearestIndex clamps to the series bounds", () => {
    expect(nearestIndex(-999, DEFAULT_BOX, 10)).toBe(0);
    expect(nearestIndex(9999, DEFAULT_BOX, 10)).toBe(9);
  });

  it("nearestIndex handles a single point and a degenerate plot", () => {
    expect(nearestIndex(0, DEFAULT_BOX, 1)).toBe(0);
    expect(nearestIndex(999, DEFAULT_BOX, 0)).toBe(0);
  });

  it("ticksFor collapses a degenerate or inverted span to the min", () => {
    expect(ticksFor(5, 5)).toEqual([5]);
    expect(ticksFor(5, 4)).toEqual([5]);
  });

  it("ticksFor honours count and stays within [min, max] bounds", () => {
    const ticks = ticksFor(0, 20, 10);
    expect(ticks[0]).toBe(0);
    expect(ticks.at(-1)).toBe(20);
    for (const t of ticks) {
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(20);
    }
    for (const t of ticksFor(3.7, 9.2, 3)) {
      expect(t).toBeGreaterThanOrEqual(3.7);
      expect(t).toBeLessThanOrEqual(9.2);
    }
  });

  it("scaleOf survives an empty range and a zero-area plot", () => {
    const scale = scaleOf(DEFAULT_BOX, 2, { min: 0, max: 1, empty: true });
    expect(scale.y(0)).toBe(DEFAULT_BOX.padTop + DEFAULT_BOX.height - DEFAULT_BOX.padTop - DEFAULT_BOX.padBottom);
    expect(scale.y(1)).toBe(DEFAULT_BOX.padTop);
  });

  it("valueRange opens a flat zero series with a unit band", () => {
    const r = valueRange(one([0, 0, 0]));
    expect(r).toEqual({ min: -1, max: 1, empty: false });
  });

  it("valueRange skips non-finite thresholds", () => {
    const r = valueRange(one([1]), [Number.NaN, Number.POSITIVE_INFINITY]);
    expect(r.min).toBeDefined();
    expect(r.empty).toBe(false);
  });
});

describe("pathOf — gap semantics", () => {
  it("a null point breaks the path instead of dipping to zero", () => {
    const scale = scaleOf(DEFAULT_BOX, 5, { min: 0, max: 10, empty: false });
    const path = pathOf([1, null, 3, 4, 5], scale);
    // two M commands: the line restarts after the gap
    const starts = path.match(/M/g) ?? [];
    expect(starts.length).toBe(2);
    expect(path).not.toContain("NaN");
  });

  it("a continuous series is a single run", () => {
    const scale = scaleOf(DEFAULT_BOX, 3, { min: 0, max: 10, empty: false });
    const path = pathOf([1, 2, 3], scale);
    const starts = path.match(/M/g) ?? [];
    expect(starts.length).toBe(1);
  });

  it("an all-gap or empty series produces no path at all", () => {
    const scale = scaleOf(DEFAULT_BOX, 5, { min: 0, max: 10, empty: false });
    expect(pathOf([null, null], scale)).toBe("");
    expect(pathOf([], scale)).toBe("");
    expect(pathOf([Number.NaN, Number.POSITIVE_INFINITY], scale)).toBe("");
  });

  it("a single finite point is a lone M with no line", () => {
    const scale = scaleOf(DEFAULT_BOX, 1, { min: 0, max: 10, empty: false });
    const path = pathOf([5], scale);
    expect(path.startsWith("M")).toBe(true);
    expect(path).not.toContain("L");
  });
});
