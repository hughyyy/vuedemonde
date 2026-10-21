// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Slider from "../src/kit/Slider.vue";

describe("Slider — range contract", () => {
  it("is a keyboard-operable slider with aria values", async () => {
    const wrapper = mount(Slider, { props: { modelValue: 50 } });
    const el = wrapper.find("[role='slider']");
    expect(el.attributes("aria-valuenow")).toBe("50");
    expect(el.attributes("aria-valuemin")).toBe("0");
    expect(el.attributes("aria-valuemax")).toBe("100");
    expect(el.attributes("tabindex")).toBe("0");
    await el.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([51]);
    await el.trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([49]);
  });

  it("clamps keyboard steps to the min/max bounds", async () => {
    const wrapper = mount(Slider, { props: { modelValue: 98 } });
    const el = wrapper.find("[role='slider']");
    await el.trigger("keydown", { key: "ArrowRight" });
    await wrapper.setProps({ modelValue: 99 });
    await el.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([100]);
  });

  it("never renders NaN fill for a degenerate min===max range", () => {
    const wrapper = mount(Slider, { props: { modelValue: 5, min: 5, max: 5 } });
    expect(wrapper.html()).not.toContain("NaN");
  });
});
