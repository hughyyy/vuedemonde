// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Fieldset from "../src/kit/Fieldset.vue";
import CalendarToolbar from "../src/calendar/CalendarToolbar.vue";

describe("Fieldset — disclosure wiring", () => {
  it("ties the toggle to its body via aria-controls", () => {
    const wrapper = mount(Fieldset, {
      props: { legend: "Details", toggleable: true, open: true },
      slots: { default: "<p>body</p>" },
    });
    const btn = wrapper.find("button");
    expect(btn.attributes("aria-expanded")).toBe("true");
    expect(btn.attributes("aria-controls")).toBe(wrapper.find(".fieldset__body").attributes("id"));
  });
});

describe("CalendarToolbar — view tabs", () => {
  it("announces the active view as a selected tab", () => {
    const wrapper = mount(CalendarToolbar, { props: { title: "Oct", view: "scheduler", onUpdateView: () => {} } as never });
    const tabs = wrapper.findAll("[role='tab']");
    expect(tabs.length).toBe(3);
    expect(tabs.find((t) => t.text().includes("Scheduler"))?.attributes("aria-selected")).toBe("true");
  });
});
