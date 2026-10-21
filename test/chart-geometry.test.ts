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
    expect(ticksFor(0, 100)).toEqual([0, 50, 100]);
    expect(ticksFor(0, 10)).toEqual([0, 2.5, 5, 7.5, 10]);
    expect(ticksFor(800, 900, 4)[0]).toBeGreaterThanOrEqual(800);
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
});
