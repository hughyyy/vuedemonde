// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount, type DOMWrapper } from "@vue/test-utils";
import Stepper from "../src/kit/Stepper.vue";
import ToggleButton from "../src/kit/ToggleButton.vue";
import Timeline from "../src/kit/Timeline.vue";
import MeterGroup from "../src/kit/MeterGroup.vue";
import type { StepperItem, TimelineItem } from "../src/kit/types";

/** Segment width % parsed out of the inline width style. */
const segWidth = (seg: DOMWrapper<Element>) => parseFloat(seg.attributes("style")!.match(/width:\s*([\d.]+)%/)![1]!);

const steps: StepperItem[] = [
  { id: "s1", label: "Details" },
  { id: "s2", label: "Billing" },
  { id: "s3", label: "Confirm" },
];

const mountSteps = (props: { modelValue: string; linear?: boolean }) =>
  mount(Stepper, { props: { steps, ...props } });

describe("Stepper", () => {
  it("renders every step with a numbered node; the active one is highlighted", () => {
    const w = mountSteps({ modelValue: "s2" });
    // the active node is preceded by done steps: those render a check icon instead of a number
    expect(w.findAll(".stepper__step").map((s) => s.text())).toEqual(["Details", "2Billing", "3Confirm"]);
    expect(w.findAll(".stepper__node").map((n) => n.text())).toEqual(["", "2", "3"]);

    const stepsEl = w.findAll(".stepper__step");
    expect(stepsEl[1]!.classes()).toContain("is-active");
    expect(stepsEl[1]!.find("button").attributes("aria-current")).toBe("step");
    // done (before active) vs locked (after active)
    expect(stepsEl[0]!.classes()).toContain("is-done");
    expect(stepsEl[2]!.classes()).toContain("is-locked");
  });

  it("linear mode blocks jumping forward but allows going back", async () => {
    const w = mountSteps({ modelValue: "s2", linear: true });
    await w.findAll(".stepper__node")[2]!.trigger("click"); // s3 forward
    expect(w.emitted("update:modelValue")).toBeUndefined();

    await w.findAll(".stepper__node")[0]!.trigger("click"); // s1 backward
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["s1"]);
  });

  it("non-linear mode lets any step be activated", async () => {
    const w = mountSteps({ modelValue: "s1", linear: false });
    await w.findAll(".stepper__node")[2]!.trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["s3"]);
  });

  it("bounds: the first step is always reachable; the last step re-emits its own id", async () => {
    const w = mountSteps({ modelValue: "s1" });
    await w.findAll(".stepper__node")[0]!.trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["s1"]);

    const w2 = mountSteps({ modelValue: "s3" });
    await w2.findAll(".stepper__node")[2]!.trigger("click");
    expect(w2.emitted("update:modelValue")!.at(-1)).toEqual(["s3"]);
  });

  it("renders the per-step panel and actions slots", () => {
    const w = mount(Stepper, {
      props: { steps, modelValue: "s1" },
      slots: { "step-s1": "NAME PANEL", actions: '<button type="button">Next</button>' },
    });
    expect(w.find(".stepper__body").text()).toContain("NAME PANEL");
    expect(w.find(".stepper__actions").text()).toBe("Next");
  });

  it("an unknown modelValue locks nothing and the first step is clickable", async () => {
    const w = mountSteps({ modelValue: "nope" });
    expect(w.findAll(".stepper__step.is-active")).toHaveLength(0);
    await w.findAll(".stepper__node")[0]!.trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["s1"]);
  });
});

describe("ToggleButton", () => {
  it("renders aria-pressed from modelValue and the active style/check", () => {
    const on = mount(ToggleButton, { props: { modelValue: true, label: "Turbo" } });
    expect(on.find("button").attributes("aria-pressed")).toBe("true");
    expect(on.find("button").classes()).toContain("is-active");
    expect(on.find(".toggle-button__check").exists()).toBe(true);
    expect(on.text()).toContain("Turbo");

    const off = mount(ToggleButton, { props: { modelValue: false } });
    expect(off.find("button").attributes("aria-pressed")).toBe("false");
    expect(off.find(".toggle-button__check").exists()).toBe(false);
  });

  it("click emits the inverted value", async () => {
    const w = mount(ToggleButton, { props: { modelValue: false } });
    await w.find("button").trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([true]);

    const w2 = mount(ToggleButton, { props: { modelValue: true } });
    await w2.find("button").trigger("click");
    expect(w2.emitted("update:modelValue")!.at(-1)).toEqual([false]);
  });

  it("disabled button is inert", async () => {
    const w = mount(ToggleButton, { props: { modelValue: false, disabled: true } });
    expect(w.find("button").attributes("disabled")).toBeDefined();
    await w.find("button").trigger("click");
    expect(w.emitted("update:modelValue")).toBeUndefined();
  });
});

describe("Timeline", () => {
  const items: TimelineItem[] = [
    { id: "t1", title: "Created", time: "09:00", tint: "ok", content: "Ticket opened" },
    { id: "t2", title: "Blocked", tint: "err", icon: "warn" },
    { id: "t3", title: "Done" },
  ];

  it("renders entries in order with title, time, content, icon and tint markers", () => {
    const w = mount(Timeline, { props: { items } });
    expect(w.findAll(".timeline__entry")).toHaveLength(3);
    expect(w.findAll(".timeline__title").map((t) => t.text())).toEqual(["Created", "Blocked", "Done"]);
    expect(w.find(".timeline__time").text()).toBe("09:00");
    expect(w.find(".timeline__content").text()).toBe("Ticket opened");
    expect(w.findAll(".timeline__dot")[1]!.classes()).toContain("is-err");
    expect(w.findAll(".timeline__dot")[0]!.classes()).toContain("is-ok");
  });

  it("draws a connector between every pair of entries", () => {
    const w = mount(Timeline, { props: { items } });
    expect(w.findAll(".timeline__line")).toHaveLength(2);
  });

  it("an empty array renders an empty timeline without crashing", () => {
    const w = mount(Timeline, { props: { items: [] } });
    expect(w.find(".timeline").exists()).toBe(true);
    expect(w.findAll(".timeline__entry")).toHaveLength(0);
  });
});

describe("MeterGroup", () => {
  it("renders segments sized against the largest value plus a legend", () => {
    const w = mount(MeterGroup, {
      props: { meters: [{ label: "Low", value: 30 }, { label: "High", value: 60 }, { label: "Zero", value: 0 }] },
    });
    const segs = w.findAll(".meter-group__seg");
    expect(segs).toHaveLength(3);

    expect(segWidth(segs[0]!)).toBeCloseTo(50, 5); // 30/60
    expect(segWidth(segs[1]!)).toBeCloseTo(100, 5); // 60/60
    // a zero-value segment still renders (at 0 width)
    expect(segWidth(segs[2]!)).toBeCloseTo(0, 5);

    expect(w.findAll(".meter-group__label").map((l) => l.text())).toEqual(["Low", "High", "Zero"]);
    expect(w.findAll(".meter-group__value").map((v) => v.text())).toEqual(["30", "60", "0"]);
  });

  it("a per-meter max scales the common max", () => {
    const w = mount(MeterGroup, {
      props: { meters: [{ label: "A", value: 50, max: 100 }, { label: "B", value: 25 }] },
    });
    const segs = w.findAll(".meter-group__seg");
    expect(segWidth(segs[0]!)).toBeCloseTo(50, 5); // 50/100
    expect(segWidth(segs[1]!)).toBeCloseTo(25, 5); // 25/100
    expect(w.find(".meter-group__value").text()).toBe("50/100");
  });

  it("applies the tint as the segment background", () => {
    const w = mount(MeterGroup, { props: { meters: [{ label: "X", value: 10, tint: "err" }] } });
    expect(w.find(".meter-group__seg").attributes("style")).toContain("var(--err)");
  });

  it("an empty array renders an empty track without crashing", () => {
    const w = mount(MeterGroup, { props: { meters: [] } });
    expect(w.findAll(".meter-group__seg")).toHaveLength(0);
    expect(w.findAll(".meter-group__item")).toHaveLength(0);
  });
});
