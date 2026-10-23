// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import MonthCalendar from "../src/calendar/MonthCalendar.vue";
import WeekCalendar from "../src/calendar/WeekCalendar.vue";
import DayCalendar from "../src/calendar/DayCalendar.vue";
import SchedulerView from "../src/calendar/SchedulerView.vue";
import { addMonths, fmtMonthTitle, startOfDay, type CalendarEvent } from "../src/calendar/model";

const at = (day: number, h = 9, m = 0) => new Date(2026, 4, day, h, m); // May 2026

const ev = (id: string, day: number, h = 9, over: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id,
  title: id,
  start: at(day, h),
  end: at(day, h + 1),
  tint: "indigo",
  ...over,
});

/** Find the day cell whose date number matches. */
function dayCell(w: ReturnType<typeof mount>, day: number) {
  return w.findAll(".month-cal__day").find((c) => c.find(".month-cal__num").text() === String(day))!;
}

describe("MonthCalendar — grid, stacking, overflow", () => {
  const anchor = new Date(2026, 4, 13); // Wednesday 13 May 2026

  it("renders 6×7 cells with weekday headers and outside-month markers", () => {
    const w = mount(MonthCalendar, { props: { anchor, events: [] } });
    expect(w.findAll(".month-cal__weekday").map((t) => t.text())).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    const cells = w.findAll(".month-cal__day");
    expect(cells).toHaveLength(42);
    // grid starts Sunday 26 Apr (outside) and ends Saturday 6 Jun (outside)
    expect(cells[0].find(".month-cal__num").text()).toBe("26");
    expect(cells[0].classes()).toContain("is-outside");
    expect(cells[5].find(".month-cal__num").text()).toBe("1"); // May 1
    expect(cells[5].classes()).not.toContain("is-outside");
    expect(cells[41].find(".month-cal__num").text()).toBe("6");
    expect(cells[41].classes()).toContain("is-outside");
    expect(w.findAll(".month-cal__day.is-outside")).toHaveLength(11); // 5 Apr + 6 Jun
  });

  it("places events only on their own calendar day", () => {
    const w = mount(MonthCalendar, {
      props: {
        anchor,
        events: [ev("a", 13), ev("b", 20), ev("c", 2), ev("d", 5, 9, { allDay: true })],
      },
    });
    expect(dayCell(w, 13).findAll(".event-chip")).toHaveLength(1);
    expect(dayCell(w, 20).findAll(".event-chip")).toHaveLength(1);
    expect(dayCell(w, 2).findAll(".event-chip")).toHaveLength(1); // May 2 — the only "2" cell in the grid
    expect(dayCell(w, 5).findAll(".event-chip")).toHaveLength(1); // all-day included
    expect(w.findAll(".event-chip")).toHaveLength(4);
  });

  it("caps a crowded day at 3 chips and expands/collapses via +N more", async () => {
    const events = [1, 2, 3, 4, 5].map((i) => ev(`e${i}`, 13, 9 + i * 0.01));
    const w = mount(MonthCalendar, { props: { anchor, events } });
    const cell = dayCell(w, 13);
    expect(cell.findAll(".event-chip")).toHaveLength(3);
    expect(cell.find(".month-cal__more").text()).toBe("+2 more");
    await cell.find(".month-cal__more").trigger("click");
    expect(dayCell(w, 13).findAll(".event-chip")).toHaveLength(5);
    expect(dayCell(w, 13).find(".month-cal__more").text()).toBe("show less");
    // collapse back via the show-less button
    await dayCell(w, 13).find(".month-cal__more").trigger("click");
    expect(dayCell(w, 13).findAll(".event-chip")).toHaveLength(3);
    expect(dayCell(w, 13).find(".month-cal__more").text()).toBe("+2 more");
    // per-day independence: expanding one day never disturbs another
    const other = [6, 7, 8, 9].map((i) => ev(`x${i}`, 20, 9 + i * 0.01));
    const w2 = mount(MonthCalendar, { props: { anchor, events: [...events, ...other] } });
    await dayCell(w2, 13).find(".month-cal__more").trigger("click");
    expect(dayCell(w2, 13).findAll(".event-chip")).toHaveLength(5);
    expect(dayCell(w2, 20).findAll(".event-chip")).toHaveLength(3); // untouched day still capped
    expect(dayCell(w2, 20).find(".month-cal__more").text()).toBe("+1 more");
  });

  it("clicking a chip emits open with the event", async () => {
    const w = mount(MonthCalendar, { props: { anchor, events: [ev("a", 13)] } });
    await dayCell(w, 13).find(".event-chip").trigger("click");
    expect(w.emitted("open")![0]).toEqual([expect.objectContaining({ id: "a" })]);
  });

  it("marks exactly today's cell when the anchor month is the current month", () => {
    const now = new Date();
    const anchorIsCurrent = now.getFullYear() === 2026 && now.getMonth() === 4;
    const w = mount(MonthCalendar, { props: { anchor, events: [] } });
    const today = w.findAll(".month-cal__day.is-today");
    if (anchorIsCurrent) {
      expect(today).toHaveLength(1);
      expect(today[0].find(".month-cal__num").text()).toBe(String(now.getDate()));
    } else {
      expect(today).toHaveLength(0);
    }
  });
});

describe("WeekCalendar — time grid, lanes, all-day strip", () => {
  const anchor = new Date(2026, 4, 13); // Wednesday — week starts Sun 10 May
  const week = (over: Partial<CalendarEvent> = {}) => ev("w1", 13, 9, over);

  it("renders the seven day heads Sun 10 … Sat 16 and 14 hour labels", () => {
    const w = mount(WeekCalendar, { props: { anchor, events: [] } });
    const heads = w.findAll(".week-cal__dayhead");
    expect(heads).toHaveLength(7);
    expect(heads.map((h) => h.find(".week-cal__dayname").text())).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    expect(heads.map((h) => h.find(".week-cal__daynum").text())).toEqual(["10", "11", "12", "13", "14", "15", "16"]);
    expect(w.findAll(".week-cal__hour").map((t) => t.text())).toEqual(["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"]);
  });

  it("positions a timed event by start/duration (40px/hour grid)", () => {
    const w = mount(WeekCalendar, { props: { anchor, events: [week()] } });
    const tile = w.find(".week-cal__ev");
    expect(tile.exists()).toBe(true);
    const style = tile.attributes("style")!;
    expect(style).toContain("top: 40px"); // 9:00 = hour 1
    expect(style).toContain("height: 40px"); // 60 min
    expect(style).toContain("width: 100%");
  });

  it("stacks overlapping events into half-width lanes", () => {
    const w = mount(WeekCalendar, {
      props: {
        anchor,
        events: [week(), ev("w2", 13, 9, { title: "w2" }), ev("w3", 13, 9, { title: "w3" })],
      },
    });
    expect(w.findAll(".week-cal__ev")).toHaveLength(3);
    for (const t of w.findAll(".week-cal__ev")) {
      expect(t.attributes("style")).toContain("width: 33.333333333333336%");
    }
  });

  it("keeps events of other days in their own column and ignores out-of-week events", () => {
    const w = mount(WeekCalendar, {
      props: { anchor, events: [week(), ev("fri", 15, 10), ev("nextweek", 17, 9)] },
    });
    expect(w.findAll(".week-cal__ev")).toHaveLength(2);
    // Wednesday's tile in the Wed column (index 3), Friday's in column 5
    const cols = w.findAll(".week-cal__daycol");
    expect(cols[3].findAll(".week-cal__ev")).toHaveLength(1);
    expect(cols[5].findAll(".week-cal__ev")).toHaveLength(1);
    expect(cols[0].findAll(".week-cal__ev")).toHaveLength(0);
  });

  it("renders the all-day strip only when an in-week all-day event exists", () => {
    const noStrip = mount(WeekCalendar, { props: { anchor, events: [week()] } });
    expect(noStrip.find(".week-cal__allday").exists()).toBe(false);
    const withStrip = mount(WeekCalendar, {
      props: { anchor, events: [ev("ad", 13, 0, { allDay: true }), ev("ad2", 15, 0, { allDay: true }), ev("out", 20, 0, { allDay: true })] },
    });
    const strip = withStrip.find(".week-cal__allday");
    expect(strip.exists()).toBe(true);
    expect(strip.find(".week-cal__gutter--label").text()).toBe("all-day");
    expect(strip.findAll(".event-tile")).toHaveLength(2); // out-of-week all-day excluded
    expect(withStrip.findAll(".week-cal__ev")).toHaveLength(0); // all-day never lands in the timed grid
  });

  it("emits open with the event when a tile is clicked", async () => {
    const w = mount(WeekCalendar, { props: { anchor, events: [week()] } });
    await w.find(".week-cal__ev").trigger("click");
    expect(w.emitted("open")![0]).toEqual([expect.objectContaining({ id: "w1" })]);
  });

  it("draws the current-time marker only when now falls in the week and window", () => {
    const w = mount(WeekCalendar, { props: { anchor, events: [] } });
    const now = new Date();
    const inWeek = now >= new Date(2026, 4, 10) && now < new Date(2026, 4, 17);
    const marker = w.find(".week-cal__now");
    if (inWeek) {
      expect(marker.exists()).toBe(true);
    } else {
      expect(marker.exists()).toBe(false);
    }
  });
});

describe("DayCalendar — single-day fine grid", () => {
  const anchor = new Date(2026, 4, 13);

  it("renders the day header with name and short date", () => {
    const w = mount(DayCalendar, { props: { anchor, events: [] } });
    expect(w.find(".day-cal__dayname").text()).toBe("Wed");
    // locale ordering differs across environments (May 13 vs 13 May)
    expect(w.find(".day-cal__daynum").text()).toMatch(/May 13|13 May/);
  });

  it("renders hour labels (08:00 … 21:00, plus 22) and half-hour faint lines", () => {
    const w = mount(DayCalendar, { props: { anchor, events: [] } });
    const labels = w.findAll(".day-cal__hour").map((t) => t.text());
    expect(labels[0]).toBe("08:00");
    expect(labels.at(-2)).toBe("21:00");
    expect(labels.at(-1)).toBe("22");
    expect(w.findAll(".day-cal__line--faint")).toHaveLength(14); // 08:30 … 21:30
  });

  it("positions a timed event on the 44px/hour grid", () => {
    const w = mount(DayCalendar, { props: { anchor, events: [ev("a", 13, 9)] } });
    const style = w.find(".day-cal__ev").attributes("style")!;
    expect(style).toContain("top: 44px");
    expect(style).toContain("height: 44px");
  });

  it("shows the all-day strip for anchor-day all-day events only", () => {
    const w = mount(DayCalendar, {
      props: { anchor, events: [ev("a", 13, 0, { allDay: true }), ev("b", 14, 0, { allDay: true }), ev("c", 13, 10)] },
    });
    expect(w.find(".day-cal__allday").exists()).toBe(true);
    expect(w.findAll(".day-cal__allday .event-tile")).toHaveLength(1);
    expect(w.findAll(".day-cal__ev")).toHaveLength(1); // timed only
  });

  it("emits open on tile click and keeps the current-time marker contract", async () => {
    const w = mount(DayCalendar, { props: { anchor, events: [ev("a", 13, 9)] } });
    await w.find(".day-cal__ev").trigger("click");
    expect(w.emitted("open")![0]).toEqual([expect.objectContaining({ id: "a" })]);
    const now = new Date();
    const sameDayAnchor = now.getFullYear() === 2026 && now.getMonth() === 4 && now.getDate() === 13;
    const marker = w.find(".day-cal__now");
    if (sameDayAnchor) {
      expect(marker.exists()).toBe(true);
    } else {
      expect(marker.exists()).toBe(false);
    }
  });
});

describe("SchedulerView — toolbar, view switching, event dialog wiring", () => {
  it("starts in the traditional month view and switches views from the toolbar", async () => {
    const w = mount(SchedulerView, { global: { stubs: { EventDialog: true } } });
    expect(w.find(".month-cal").exists()).toBe(true);
    const tabs = w.findAll('[role="tab"]');
    await tabs[1].trigger("click"); // Scheduler
    expect(w.find(".week-cal").exists()).toBe(true);
    await tabs[2].trigger("click"); // Granular
    expect(w.find(".day-cal").exists()).toBe(true);
    expect(w.find(".month-cal").exists()).toBe(false);
  });

  it("prev/next/today move the anchor and the title follows", async () => {
    const w = mount(SchedulerView, { global: { stubs: { EventDialog: true } } });
    await w.find('[aria-label="Next"]').trigger("click");
    const expected = fmtMonthTitle(addMonths(startOfDay(new Date()), 1));
    expect(w.find(".cal-toolbar__title").text()).toBe(expected);
    await w.find(".cal-toolbar__today").trigger("click");
    expect(w.find(".cal-toolbar__title").text()).toBe(fmtMonthTitle(new Date()));
  });

  it("opening an event fills the dialog and updates patch the live event", async () => {
    const w = mount(SchedulerView, {
      global: {
        stubs: {
          EventDialog: defineComponent({
            name: "EventDialog",
            props: { open: Boolean },
            template: '<div class="fake-dialog" v-if="open" />',
          }),
        },
      },
    });
    // today's seeded events: click the first chip in the month grid
    const chip = w.find(".event-chip");
    expect(chip.exists()).toBe(true);
    await chip.trigger("click");
    const dialog = w.findComponent({ name: "EventDialog" });
    expect(dialog.props("open")).toBe(true);
    dialog.vm.$emit("update", { title: "Renamed" });
    await w.vm.$nextTick();
    expect(w.text()).toContain("Renamed");
    dialog.vm.$emit("close");
    await w.vm.$nextTick();
    expect(dialog.props("open")).toBe(false);
  });
});
