// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppRadio from "../src/kit/AppRadio.vue";

const options = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

const twoGroups = {
  components: { AppRadio },
  data: () => ({ m1: "a", m2: "b", options }),
  template: `<div>
    <AppRadio :model-value="m1" :options="options" />
    <AppRadio :model-value="m2" :options="options" />
  </div>`,
};

describe("AppRadio — group semantics", () => {
  it("gives every instance its own input name (groups never collide)", () => {
    const wrapper = mount(twoGroups);
    const inputs = wrapper.findAll("input");
    const firstGroup = inputs[0]!.attributes("name");
    const secondGroup = inputs[2]!.attributes("name");
    expect(firstGroup).toBeTruthy();
    expect(firstGroup).not.toBe(secondGroup);
  });

  it("marks only the selected option checked and emits updates", async () => {
    const wrapper = mount(AppRadio, { props: { modelValue: "a", options } });
    const inputs = wrapper.findAll("input");
    expect(inputs[0]!.element.checked).toBe(true);
    expect(inputs[1]!.element.checked).toBe(false);
    await inputs[1]!.setValue();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["b"]);
  });
});
