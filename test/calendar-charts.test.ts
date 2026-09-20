import { describe, expect, it } from "vitest";
import { addDays, fmtDayTitle, monthMatrix, sameDay, seedEvents, startOfWeek, weekDays } from "../src/calendar/model";
import { fmtTick, niceMax } from "../src/charts/shared";

describe("calendar model", () => {
  const anchor = new Date(2026, 0, 15); // a Thursday

  it("monthMatrix is 6×7 starting on the containing Sunday", () => {
    const grid = monthMatrix(anchor);
    expect(grid).toHaveLength(6);
    for (const row of grid) expect(row).toHaveLength(7);
    expect(grid[0]![0]!.getDay()).toBe(0);
    // the grid covers the whole month window
    const first = grid[0]![0]!;
    const last = grid[5]![6]!;
    expect(first.getTime() < anchor.getTime()).toBe(true);
    expect(last.getTime() > anchor.getTime()).toBe(true);
  });

  it("startOfWeek + addDays reconstructs the 7 week days", () => {
    const s = startOfWeek(anchor);
    expect(s.getDay()).toBe(0);
    const days = weekDays(anchor);
    expect(days).toHaveLength(7);
    expect(sameDay(days[2], addDays(s, 2))).toBe(true);
  });

  it("seedEvents are sorted around today and carry both all-day and timed events", () => {
    const events = seedEvents(new Date(2026, 0, 15));
    expect(events.length).toBe(10);
    expect(events.some((e) => e.allDay)).toBe(true);
    expect(events.some((e) => !e.allDay)).toBe(true);
    expect(fmtDayTitle(events[1]!.start)).toContain("Jan");
  });
});

describe("chart helpers", () => {
  it("niceMax rounds up to 1/2/5 × 10ⁿ", () => {
    expect(niceMax(7)).toBe(10);
    expect(niceMax(2.2)).toBe(5);
    expect(niceMax(0)).toBe(1);
    expect(niceMax(120)).toBe(200);
  });

  it("fmtTick abbreviates thousands", () => {
    expect(fmtTick(500)).toBe("500");
    expect(fmtTick(1500)).toBe("1.5k");
    expect(fmtTick(3000)).toBe("3k");
  });
});
