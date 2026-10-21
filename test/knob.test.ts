// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Knob from "../src/kit/Knob.vue";

describe("Knob — dial contract", () => {
  it("is a slider with aria values and arrow-key stepping", async () => {
    const wrapper = mount(Knob, { props: { modelValue: 40 } });
    const dial = wrapper.find("[role='slider']");
    expect(dial.attributes("aria-valuenow")).toBe("40");
    expect(dial.attributes("tabindex")).toBe("0");
    await dial.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([41]);
    await dial.trigger("keydown", { key: "ArrowDown" });
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([39]);
  });

  it("never renders NaN arcs for a degenerate min===max range", () => {
    const wrapper = mount(Knob, { props: { modelValue: 5, min: 5, max: 5 } });
    expect(wrapper.html()).not.toContain("NaN");
  });
});
