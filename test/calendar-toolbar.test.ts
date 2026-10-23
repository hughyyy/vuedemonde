// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CalendarToolbar from "../src/calendar/CalendarToolbar.vue";

describe("CalendarToolbar — navigation + view switching", () => {
  it("renders the title and nav buttons", () => {
    const w = mount(CalendarToolbar, { props: { title: "January 2026", view: "traditional" }, global: { stubs: { AppIcon: true } } });
    expect(w.find(".cal-toolbar__title").text()).toBe("January 2026");
    expect(w.find('[aria-label="Previous"]').exists()).toBe(true);
    expect(w.find('[aria-label="Next"]').exists()).toBe(true);
    expect(w.find(".cal-toolbar__today").text()).toBe("Today");
  });

  it("emits prev/next/today from the nav buttons", async () => {
    const w = mount(CalendarToolbar, { props: { title: "T", view: "traditional" }, global: { stubs: { AppIcon: true } } });
    await w.find('[aria-label="Previous"]').trigger("click");
    await w.find('[aria-label="Next"]').trigger("click");
    await w.find(".cal-toolbar__today").trigger("click");
    expect(w.emitted("prev")).toHaveLength(1);
    expect(w.emitted("next")).toHaveLength(1);
    expect(w.emitted("today")).toHaveLength(1);
  });

  it("is a tablist with tab roles and aria-selected on the active view", async () => {
    const w = mount(CalendarToolbar, { props: { title: "T", view: "scheduler" }, global: { stubs: { AppIcon: true } } });
    const list = w.find('[role="tablist"]');
    expect(list.exists()).toBe(true);
    const tabs = w.findAll('[role="tab"]');
    expect(tabs).toHaveLength(3); // traditional / scheduler / granular
    expect(tabs.map((t) => t.text())).toEqual(["Traditional", "Scheduler", "Granular"]);
    expect(tabs[1].attributes("aria-selected")).toBe("true");
    expect(tabs[0].attributes("aria-selected")).toBe("false");
    await tabs[2].trigger("click");
    expect(w.emitted("update:view")!.at(-1)).toEqual(["granular"]);
  });
});
