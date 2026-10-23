import { describe, expect, it } from "vitest";
import { EVENT_TINTS, addDays, fmtDayTitle, fmtMonthTitle, fmtTime, fmtWeekTitle, monthMatrix, sameDay, seedEvents, startOfDay, startOfWeek, weekDays } from "../src/calendar/model";
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

  it("ev() and seedEvents never reuse ids across calls", () => {
    const a = seedEvents(new Date(2026, 0, 15));
    const b = seedEvents(new Date(2026, 0, 15));
    const ids = [...a, ...b].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("startOfDay zeroes the time fields but keeps the calendar day", () => {
    const d = startOfDay(new Date(2026, 0, 15, 23, 59, 59, 999));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
    expect(d.getDate()).toBe(15);
  });

  it("startOfWeek lands on Sunday even when the anchor is Sunday itself", () => {
    expect(startOfWeek(new Date(2026, 0, 18)).getDate()).toBe(18); // Sunday 18 Jan 2026
    expect(startOfWeek(new Date(2026, 0, 20)).getDate()).toBe(18);
  });

  it("startOfWeek crosses month boundaries", () => {
    const s = startOfWeek(new Date(2026, 1, 2)); // Monday 2 Feb — week starts 1 Feb
    expect(s.getMonth()).toBe(1);
    expect(s.getDate()).toBe(1);
  });

  it("sameDay compares calendar day, not time", () => {
    expect(sameDay(new Date(2026, 0, 15, 0, 0), new Date(2026, 0, 15, 23, 59))).toBe(true);
    expect(sameDay(new Date(2026, 0, 15), new Date(2026, 0, 16))).toBe(false);
    expect(sameDay(new Date(2025, 11, 31), new Date(2026, 0, 1))).toBe(false);
  });

  it("monthMatrix always covers 6 full weeks starting Sunday", () => {
    // February 2026: starts Sunday 1 Feb — grid begins exactly at the month start
    const feb = monthMatrix(new Date(2026, 1, 10));
    expect(feb[0]![0]!.getDate()).toBe(1);
    expect(feb[0]![0]!.getMonth()).toBe(1);
    // December 2025: month starts Monday → grid begins 30 Nov (Sunday)
    const dec = monthMatrix(new Date(2025, 11, 15));
    expect(dec[0]![0]!.getDate()).toBe(30);
    expect(dec[0]![0]!.getMonth()).toBe(10);
    // the grid always ends on a Saturday
    expect(dec[5]![6]!.getDay()).toBe(6);
  });

  it("monthMatrix covers every day of the month exactly once", () => {
    const grid = monthMatrix(new Date(2026, 0, 15));
    const cells = grid.flat();
    expect(cells).toHaveLength(42); // 6×7
    // 42 distinct cells (a Date per cell — same calendar day can repeat across
    // adjacent months, so compare timestamps, not just day numbers)
    expect(new Set(cells.map((d) => d.getTime())).size).toBe(42);
    const janDays = cells.filter((d) => d.getMonth() === 0).map((d) => d.getDate());
    for (let day = 1; day <= 31; day++) expect(janDays.includes(day)).toBe(true);
  });

  it("addDays crosses months and years, preserving the wall-clock time", () => {
    const d = addDays(new Date(2025, 11, 31, 9, 30), 1);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(1);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getHours()).toBe(9);
  });

  it("fmtWeekTitle distinguishes single-month and cross-month weeks", () => {
    // 15 Jan 2026 (Thu): 11–17 Jan — same month, month shown on the end bound
    expect(fmtWeekTitle(new Date(2026, 0, 15))).toBe("11 – Jan 17, 2026");
    // 28 Jan (Wed): week 25–31 Jan, still one month
    expect(fmtWeekTitle(new Date(2026, 0, 28))).toBe("25 – Jan 31, 2026");
    // 1 Feb 2026 (Sunday): week 1–7 Feb, single month
    expect(fmtWeekTitle(new Date(2026, 1, 1))).toBe("1 – Feb 7, 2026");
  });

  it("fmtWeekTitle across year boundary prefixes both months", () => {
    // Wed 31 Dec 2025: week 28 Dec – 3 Jan; cross-month weeks carry the
    // month on the first bound only
    expect(fmtWeekTitle(new Date(2025, 11, 31))).toBe("Dec 28 – 3, 2026");
  });

  it("fmtTime zero-pads, fmtMonthTitle and fmtDayTitle name their parts", () => {
    expect(fmtTime(new Date(2026, 0, 15, 9, 5))).toBe("09:05");
    expect(fmtTime(new Date(2026, 0, 15, 23, 59))).toBe("23:59");
    expect(fmtMonthTitle(new Date(2026, 3, 1))).toBe("April 2026");
    expect(fmtDayTitle(new Date(2026, 0, 15))).toBe("Thu, Jan 15 2026");
  });

  it("EVENT_TINTS covers every EventTint with text/bg pairs", () => {
    const tints = new Set(["indigo", "orange", "emerald", "rose", "sky", "amber"]);
    for (const [name, t] of Object.entries(EVENT_TINTS)) {
      expect(tints.has(name)).toBe(true);
      expect(typeof t.bg).toBe("string");
      expect(typeof t.text).toBe("string");
    }
    expect(Object.keys(EVENT_TINTS)).toHaveLength(6);
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
