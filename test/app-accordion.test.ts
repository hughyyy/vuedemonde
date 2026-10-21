// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppAccordion from "../src/kit/AppAccordion.vue";

const items = [
  { id: "a", title: "Alpha" },
  { id: "b", title: "Beta" },
];

describe("AppAccordion — disclosure contract", () => {
  it("wires each header to its panel (aria-controls) and reflects open state", () => {
    const wrapper = mount(AppAccordion, {
      props: { items, modelValue: "a" },
      slots: { "panel-a": "<p>alpha body</p>", "panel-b": "<p>beta body</p>" },
    });
    const heads = wrapper.findAll(".app-accordion__head");
    const bodies = wrapper.findAll(".app-accordion__body");
    expect(heads[0]!.attributes("aria-expanded")).toBe("true");
    const c0 = heads[0]!.attributes("aria-controls");
    expect(c0).toBeTruthy();
    expect(c0).toBe(bodies[0]!.attributes("id"));
    expect(heads[1]!.attributes("aria-expanded")).toBe("false");
    const c1 = heads[1]!.attributes("aria-controls");
    expect(c1).toBeTruthy();
    expect(c1).not.toBe(c0); // per-item ids, never shared
  });

  it("toggles single-expand semantics", async () => {
    const wrapper = mount(AppAccordion, { props: { items, modelValue: "a" } });
    await wrapper.find(".app-accordion__head").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([null]); // closing the open one
  });
});
