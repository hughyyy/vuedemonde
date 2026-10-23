// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { useCalendarState } from "../src/calendar/useCalendarState";

describe("useCalendarState — shared calendar navigation", () => {
  it("normalizes the initial anchor to midnight", () => {
    const { anchor } = useCalendarState(new Date(2026, 0, 15, 14, 30, 45));
    expect(anchor.value.getHours()).toBe(0);
    expect(anchor.value.getMinutes()).toBe(0);
    expect(anchor.value.getDate()).toBe(15);
  });

  it("starts in the traditional view with a month title", () => {
    const { view, title } = useCalendarState(new Date(2026, 6, 1));
    expect(view.value).toBe("traditional");
    expect(title.value).toBe("July 2026");
  });

  it("prev/next step by months in the traditional view", () => {
    const { anchor, prev, next } = useCalendarState(new Date(2026, 6, 15));
    next();
    expect(anchor.value.getMonth()).toBe(7);
    prev();
    prev();
    expect(anchor.value.getMonth()).toBe(5);
  });

  it("stepping into a month that lacks the anchor day overflows (documented Date artifact)", () => {
    // Jan 31 + 1 month: February 2026 has only 28 days → JS rolls into March.
    const { anchor, next } = useCalendarState(new Date(2026, 0, 31));
    next();
    expect(anchor.value.getMonth()).toBe(2); // March — flagged in the edge-case analysis
  });

  it("the scheduler view titles by week and steps by 7 days, keeping the weekday", () => {
    const { anchor, title, setView, next, prev, today } = useCalendarState(new Date(2026, 0, 15)); // Thursday
    setView("scheduler");
    expect(title.value).toMatch(/Jan|Feb/);
    expect(title.value).toContain("–");
    next();
    expect(anchor.value.getDay()).toBe(4);
    expect(anchor.value.getDate()).toBe(22);
    prev();
    prev();
    expect(anchor.value.getDate()).toBe(8);
    today();
    expect(anchor.value.getTime()).toBe(new Date().setHours(0, 0, 0, 0));
  });

  it("steps across a month boundary in scheduler view without losing the weekday", () => {
    const { anchor, setView, next } = useCalendarState(new Date(2026, 0, 29)); // Thursday
    setView("scheduler");
    next();
    expect(anchor.value.getDate()).toBe(5);
    expect(anchor.value.getMonth()).toBe(1);
    expect(anchor.value.getDay()).toBe(4);
  });

  it("the granular view titles by day and steps by single days", () => {
    const { anchor, title, setView, next, prev } = useCalendarState(new Date(2026, 0, 15));
    setView("granular");
    expect(title.value).toBe("Thu, Jan 15 2026");
    next();
    expect(anchor.value.getDate()).toBe(16);
    prev();
    prev();
    expect(anchor.value.getDate()).toBe(14);
  });

  it("the granular day title crosses midnight and year boundaries", () => {
    const { title, setView } = useCalendarState(new Date(2025, 11, 31));
    setView("granular");
    expect(title.value).toBe("Wed, Dec 31 2025");
  });

  it("title switches reactively with the view", () => {
    const { title, setView } = useCalendarState(new Date(2026, 0, 15));
    setView("granular");
    expect(title.value).toBe("Thu, Jan 15 2026");
    setView("traditional");
    expect(title.value).toBe("January 2026");
  });
});
