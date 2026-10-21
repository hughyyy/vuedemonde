// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppSelect from "../src/kit/AppSelect.vue";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("AppSelect — association and placeholder contract", () => {
  it("wires the error text to the select via aria-describedby", () => {
    const err = mount(AppSelect, { props: { modelValue: "", options, error: "pick one" } });
    const errId = err.find(".app-select__msg").attributes("id");
    expect(err.find("select").attributes("aria-describedby")).toBe(errId);
    expect(err.find("select").attributes("aria-invalid")).toBe("true");
  });

  it("renders a disabled placeholder option when set", () => {
    const wrapper = mount(AppSelect, { props: { modelValue: "", options, placeholder: "Choose…" } });
    const ph = wrapper.find("option");
    expect(ph.text()).toBe("Choose…");
    expect(ph.attributes("disabled")).toBeDefined();
    expect(ph.attributes("value")).toBe("");
  });
});
