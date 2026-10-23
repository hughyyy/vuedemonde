// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { nowTop, placeDay } from "../src/calendar/placement";

/** Grid defaults: [8:00, 22:00) @ 44px/h → 840 min, 616 px. */
const at = (h: number, m = 0, s = 0) => new Date(2026, 0, 15, h, m, s);
const ev = (id: string, start: Date, end: Date, allDay = false) => ({ id, title: id, start, end, tint: "indigo" as const, allDay });

describe("placeDay — time-grid placement", () => {
  it("places a single event at its hour offset with proportional height", () => {
    const [p] = placeDay(at(0), [ev("a", at(9, 0), at(9, 45))]);
    expect(p.top).toBe(44); // 1 hour @ 44px/h
    expect(p.height).toBe((45 / 840) * 616);
    expect(p.left).toBe(0);
    expect(p.width).toBe(100);
  });

  it("stacks overlapping events into lanes of equal width", () => {
    const placed = placeDay(at(0), [ev("a", at(9, 0), at(10, 0)), ev("b", at(9, 30), at(10, 30))]);
    const [a, b] = placed;
    expect(a.left).toBe(0);
    expect(b.left).toBe(50);
    expect(a.width).toBe(50);
    expect(b.width).toBe(50);
  });

  it("reuses a lane when the previous tile leaves a 1-minute gap, else opens a new one", () => {
    // A ends 9:45; B starts 9:46 (1-min gap) → same lane
    const reuse = placeDay(at(0), [ev("a", at(9, 0), at(9, 45)), ev("b", at(9, 46), at(10, 0))]);
    expect(reuse[1].left).toBe(reuse[0].left);
    // Back-to-back (B starts exactly when A ends) → new lane, narrower tiles
    const adjacent = placeDay(at(0), [ev("a", at(9, 0), at(9, 45)), ev("b", at(9, 45), at(10, 0))]);
    expect(adjacent[1].left).not.toBe(adjacent[0].left);
    expect(adjacent[0].width).toBe(50);
  });

  it("clamps a start before the grid to the top, keeping its duration", () => {
    const [p] = placeDay(at(0), [ev("a", at(6, 0), at(7, 0))]);
    expect(p.top).toBe(0);
    expect(p.height).toBe(44); // full hour inside the grid
  });

  it("keeps a start after day-end (renders past the grid bottom — documented)", () => {
    const [p] = placeDay(at(0), [ev("a", at(23, 0), at(23, 30))]);
    // only the lower bound is clamped; the tile sits beyond the last hour line
    expect(p.top).toBe(((23 * 60 - 8 * 60) / 840) * 616);
    expect(p.top).toBeGreaterThan(616);
  });

  it("clamps an end beyond the grid to the full window but not the remaining span", () => {
    const [p] = placeDay(at(0), [ev("a", at(21, 0), at(23, 0))]);
    expect(p.top).toBe(572);
    expect(p.height).toBe(88); // 120 min, not limited to the 60 min left in the grid
  });

  it("a zero-duration or reversed event renders at min-height", () => {
    const zero = placeDay(at(0), [ev("a", at(10, 0), at(10, 0))])[0]!;
    expect(zero.height).toBe(20); // minH
    expect(zero.top).toBe(88);
    const reversed = placeDay(at(0), [ev("b", at(11, 0), at(10, 0))])[0]!;
    expect(reversed.height).toBe(20);
  });

  it("excludes all-day events and events on other days", () => {
    const placed = placeDay(at(0), [
      ev("all", at(0, 0), at(0, 0), true),
      ev("otherday", new Date(2026, 0, 16, 9, 0), new Date(2026, 0, 16, 10, 0)),
      ev("yesterday", new Date(2026, 0, 14, 9, 0), new Date(2026, 0, 14, 10, 0)),
    ]);
    expect(placed).toHaveLength(0);
  });

  it("returns an empty list for no events", () => {
    expect(placeDay(at(0), [])).toEqual([]);
  });

  it("sorts by start time regardless of input order", () => {
    const placed = placeDay(at(0), [ev("late", at(11, 0), at(12, 0)), ev("early", at(9, 0), at(10, 0))]);
    expect(placed.map((p) => p.event.id)).toEqual(["early", "late"]);
  });

  it("respects a custom grid window and hour height", () => {
    const [p] = placeDay(at(0), [ev("a", at(10, 0), at(11, 0))], 9, 17, 50);
    expect(p.top).toBe(50); // 1h × 50px
  });

  it("counts seconds into the offset and duration", () => {
    const [p] = placeDay(at(0), [ev("a", at(9, 0, 30), at(9, 30))]);
    expect(p.top).toBe(((540 + 0.5 - 480) / 840) * 616);
  });
});

describe("nowTop — current-time marker", () => {
  const noon = new Date(2026, 0, 15, 12, 0, 0);

  it("maps the current time to pixels inside the window", () => {
    expect(nowTop(at(0), 8, 22, 44, noon)).toBe(((12 * 60 - 8 * 60) / 840) * 616);
  });

  it("is null on any other day", () => {
    expect(nowTop(new Date(2026, 0, 16), 8, 22, 44, noon)).toBeNull();
    expect(nowTop(new Date(2026, 1, 15), 8, 22, 44, noon)).toBeNull();
  });

  it("is null before the window and after it (inclusive end)", () => {
    expect(nowTop(at(0), 8, 22, 44, at(7, 59, 59))).toBeNull();
    expect(nowTop(at(0), 8, 22, 44, at(22, 0, 1))).toBeNull();
    // exactly at the top edge and the end line are both inside
    expect(nowTop(at(0), 8, 22, 44, at(8, 0, 0))).toBe(0);
    expect(nowTop(at(0), 8, 22, 44, at(22, 0, 0))).toBe(616);
  });
});
