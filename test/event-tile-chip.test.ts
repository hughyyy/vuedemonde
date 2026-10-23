// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import EventChip from "../src/calendar/EventChip.vue";
import EventTile from "../src/calendar/EventTile.vue";
import type { CalendarEvent } from "../src/calendar/model";

const ev = (over: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: "e1",
  title: "Platform sync",
  start: new Date(2026, 4, 13, 9, 0),
  end: new Date(2026, 4, 13, 9, 45),
  tint: "indigo",
  allDay: false,
  location: "Ops room 2",
  ...over,
});

describe("EventChip — compact cell vs filled block", () => {
  it("cell layout shows the start time and the full title as hover text", () => {
    const w = mount(EventChip, { props: { event: ev(), layout: "cell" } });
    expect(w.classes()).toContain("is-cell");
    expect(w.find(".event-chip__time").text()).toBe("09:00");
    expect(w.find(".event-chip__title").text()).toBe("Platform sync");
    expect(w.attributes("title")).toBe("Platform sync");
    // cell layout hides the location line
    expect(w.find(".event-chip__loc").exists()).toBe(false);
  });

  it("all-day cell events omit the time", () => {
    const w = mount(EventChip, { props: { event: ev({ allDay: true }), layout: "cell" } });
    expect(w.find(".event-chip__time").exists()).toBe(false);
    expect(w.find(".event-chip__title").text()).toBe("Platform sync");
  });

  it("block layout renders the location and an all-day bullet", () => {
    const w = mount(EventChip, { props: { event: ev(), layout: "block" } });
    expect(w.classes()).toContain("is-block");
    expect(w.find(".event-chip__loc").text()).toBe("Ops room 2");
    expect(w.find(".event-chip__time").exists()).toBe(false);
    const all = mount(EventChip, { props: { event: ev({ allDay: true }), layout: "block" } });
    expect(all.find(".event-chip__allday").exists()).toBe(true);
    expect(all.find(".event-chip__loc").text()).toBe("Ops room 2");
  });

  it("block layout without a location omits the loc span", () => {
    const w = mount(EventChip, { props: { event: ev({ location: undefined }), layout: "block" } });
    expect(w.find(".event-chip__loc").exists()).toBe(false);
  });

  it("click emits open", async () => {
    const w = mount(EventChip, { props: { event: ev() } });
    await w.trigger("click");
    expect(w.emitted("open")).toHaveLength(1);
  });
});

describe("EventTile — tinted week/day tile", () => {
  it("applies the tint's background/text/bar inline and the title attr", () => {
    const w = mount(EventTile, { props: { event: ev({ tint: "rose" }) } });
    const el = w.element as HTMLElement;
    expect(el.style.background).toBe("rgba(244, 63, 94, 0.14)"); // normalized by the DOM
    expect(el.style.color).toBe("#e11d48");
    expect(w.find(".event-tile__bar").attributes("style")).toBe("background: #e11d48;");
    expect(w.attributes("title")).toBe("Platform sync");
  });

  it("defaults to the indigo tint when none is set", () => {
    const w = mount(EventTile, { props: { event: ev({ tint: undefined }) } });
    expect((w.element as HTMLElement).style.color).toBe("#6366f1");
  });

  it("meta shows the location when present; a timed event falls back to 'all-day'", () => {
    const withLoc = mount(EventTile, { props: { event: ev() } });
    expect(withLoc.find(".event-tile__meta").text()).toContain("Ops room 2");
    // timed without location → meta renders the "all-day" fallback text
    const timed = mount(EventTile, { props: { event: ev({ location: undefined }) } });
    expect(timed.find(".event-tile__meta").text()).toContain("all-day");
    // all-day without location → no meta line at all (documented contract)
    const bare = mount(EventTile, { props: { event: ev({ location: undefined, allDay: true }) } });
    expect(bare.find(".event-tile__meta").exists()).toBe(false);
  });

  it("an all-day event with a location prefers the location text and hides the time", () => {
    const w = mount(EventTile, { props: { event: ev({ allDay: true, location: "DC-1" }) } });
    expect(w.find(".event-tile__meta").text()).toContain("DC-1");
    expect(w.find(".event-tile__meta").text()).not.toContain("all-day");
  });

  it("click emits open", async () => {
    const w = mount(EventTile, { props: { event: ev() } });
    await w.trigger("click");
    expect(w.emitted("open")).toHaveLength(1);
  });
});
