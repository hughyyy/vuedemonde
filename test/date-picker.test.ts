// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import DatePicker from "../src/kit/DatePicker.vue";

const mountPicker = (props: { modelValue?: string } = {}) =>
  mount(DatePicker, {
    props: { ...props, modelValue: props.modelValue ?? "" },
    global: { stubs: { teleport: true } },
  });

/** Day cell by its visible day-of-month number, optionally only inside/outside the anchor month. */
const dayBy = (w: VueWrapper, n: string, opts: { outside?: boolean } = {}) =>
  w
    .findAll(".date-picker__day")
    .find((d) => d.text() === n && !!d.classes().includes("is-outside") === !!opts.outside);

describe("DatePicker — panel behavior", () => {
  it("clicking the trigger opens the panel; a bound value is highlighted", async () => {
    const w = mountPicker({ modelValue: "2026-03-15" });
    expect(w.find(".date-picker__panel").exists()).toBe(false);
    // trigger shows the formatted bound value
    expect(w.find(".date-picker__value").text()).toBe("Mar 15, 2026");

    await w.find(".date-picker__trigger").trigger("click");
    expect(w.find(".date-picker__panel").exists()).toBe(true);
    expect(w.find(".date-picker__month").text()).toBe("Mar 2026");

    // exactly the bound day carries is-selected
    const sel = w.findAll(".date-picker__day.is-selected");
    expect(sel).toHaveLength(1);
    expect(sel[0]!.text()).toBe("15");
  });

  it("picking a day emits update:modelValue with the ISO format and closes", async () => {
    const w = mountPicker({ modelValue: "2026-03-05" });
    await w.find(".date-picker__trigger").trigger("click");

    await dayBy(w, "15")!.trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["2026-03-15"]);
    expect(w.find(".date-picker__panel").exists()).toBe(false);

    // single-digit day is zero-padded
    await w.find(".date-picker__trigger").trigger("click");
    await dayBy(w, "5")!.trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["2026-03-05"]);
  });

  it("adjacent-month cells emit that month's date (2026-03 grid runs Mar 1..Apr 11)", async () => {
    const w = mountPicker({ modelValue: "2026-03-15" });
    await w.find(".date-picker__trigger").trigger("click");
    // Apr 1 is the trailing is-outside "1" cell (Mar 1 is not outside: month starts Sunday)
    const apr1 = dayBy(w, "1", { outside: true })!;
    expect(apr1.classes()).toContain("is-outside");
    await apr1.trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["2026-04-01"]);
    expect(w.find(".date-picker__panel").exists()).toBe(false);
  });

  it("navigates months across the year boundary (Dec 2026 → Jan 2027)", async () => {
    const w = mountPicker({ modelValue: "2026-12-10" });
    await w.find(".date-picker__trigger").trigger("click");
    expect(w.find(".date-picker__month").text()).toBe("Dec 2026");

    await w.find('[aria-label="Next month"]').trigger("click");
    expect(w.find(".date-picker__month").text()).toBe("Jan 2027");

    await w.find('[aria-label="Previous month"]').trigger("click");
    expect(w.find(".date-picker__month").text()).toBe("Dec 2026");

    await w.find('[aria-label="Previous month"]').trigger("click");
    expect(w.find(".date-picker__month").text()).toBe("Nov 2026");
  });

  it("an empty modelValue opens cleanly with today's cell marked", async () => {
    const w = mountPicker();
    expect(w.find(".date-picker__value").text()).toBe("Pick a date");
    await w.find(".date-picker__trigger").trigger("click");

    expect(w.findAll(".date-picker__day")).toHaveLength(42);
    // anchor defaults to the current month, so exactly one cell is today
    expect(w.findAll(".date-picker__day.is-today")).toHaveLength(1);
    expect(w.find(".date-picker__value").classes()).toContain("is-empty");
  });

  it("Escape closes the open panel", async () => {
    const w = mountPicker({ modelValue: "2026-03-15" });
    await w.find(".date-picker__trigger").trigger("click");
    expect(w.find(".date-picker__panel").exists()).toBe(true);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();
    expect(w.find(".date-picker__panel").exists()).toBe(false);
  });

  it("a mousedown outside the trigger/panel closes it", async () => {
    const w = mountPicker({ modelValue: "2026-03-15" });
    await w.find(".date-picker__trigger").trigger("click");

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await nextTick();
    expect(w.find(".date-picker__panel").exists()).toBe(false);
  });
});
