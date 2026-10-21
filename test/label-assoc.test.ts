// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import FloatLabel from "../src/kit/FloatLabel.vue";
import IftaLabel from "../src/kit/IftaLabel.vue";

describe("FloatLabel / IftaLabel — label association", () => {
  it("wires the slotted label to the slotted input (for/id) on mount", async () => {
    const slots = {
      default: '<input placeholder=" " class="fld">',
      label: "Name",
    };
    for (const Comp of [FloatLabel, IftaLabel]) {
      const wrapper = mount(Comp, { slots });
      const input = wrapper.find("input.fld");
      const label = wrapper.find("label");
      expect(input.attributes("id")).toBeTruthy();
      expect(label.attributes("for")).toBe(input.attributes("id"));
    }
  });
});
