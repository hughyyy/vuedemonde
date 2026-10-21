// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import Splitter from "../src/kit/Splitter.vue";

const paneA = (w: VueWrapper) => w.find(".splitter__a").attributes("style") ?? "";

describe("Splitter", () => {
  it("is controlled: an outside modelValue change re-lays-out the panes", async () => {
    const wrapper = mount(Splitter, { props: { modelValue: 0.7 } });
    expect(paneA(wrapper)).toContain("flex-basis: 70%");
    await wrapper.setProps({ modelValue: 0.3 });
    expect(paneA(wrapper)).toContain("flex-basis: 30%");
  });

  it("clamps out-of-range ratios on the way in", async () => {
    const wrapper = mount(Splitter, { props: { modelValue: 1.5 } });
    expect(paneA(wrapper)).toContain("flex-basis: 90%");
    await wrapper.setProps({ modelValue: -2 });
    expect(paneA(wrapper)).toContain("flex-basis: 10%");
  });

  it("treats non-finite drag math as 0.5 (never NaN%)", async () => {
    const wrapper = mount(Splitter);
    const gutter = wrapper.find(".splitter__gutter");
    gutter.element.setPointerCapture = () => {}; // happy-dom lacks it; real path is a no-op guard
    await gutter.trigger("pointerdown", { pointerId: 1 });
    // host rect is all zeros in happy-dom → fraction = 0/0 = NaN → fallback 0.5
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 10, clientY: 10 }));
    window.dispatchEvent(new PointerEvent("pointerup", {}));
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe(0.5);
  });

  it("resizes with arrow keys, emits every step, and clamps at the 0.1/0.9 bounds", async () => {
    const wrapper = mount(Splitter); // unbound modelValue — emit must still fire
    const gutter = wrapper.find(".splitter__gutter");
    for (let i = 0; i < 12; i++) await gutter.trigger("keydown", { key: "ArrowRight" });
    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    // 0.5 + 12×0.05 = 1.1 → clamped to 0.9
    expect(emitted?.at(-1)?.[0]).toBe(0.9);
    await gutter.trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe(0.85);
  });

  it("rounds steps to 2dp so repeated resizes never accumulate float drift", async () => {
    const wrapper = mount(Splitter, { props: { modelValue: 0.7 } });
    const gutter = wrapper.find(".splitter__gutter");
    await gutter.trigger("keydown", { key: "ArrowRight" });
    // 0.7 + 0.05 = 0.75 exactly; 9 more steps would be 1.2 → clamped 0.9, never 0.9000000000000001
    for (let i = 0; i < 9; i++) await gutter.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe(0.9);
    const exact = wrapper.emitted("update:modelValue")?.map(([v]) => v);
    expect(exact?.every((v) => Number.isInteger((v as number) * 100))).toBe(true);
  });

  it("exposes a focusable separator with a live aria-label", () => {
    const wrapper = mount(Splitter, { props: { modelValue: 0.25 } });
    const gutter = wrapper.find(".splitter__gutter");
    expect(gutter.attributes("tabindex")).toBe("0");
    expect(gutter.attributes("aria-label")).toContain("Resize split (25%)");
  });
});
