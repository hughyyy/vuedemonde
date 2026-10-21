// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AutoComplete from "../src/kit/AutoComplete.vue";

const suggestions = ["alpha", "alpine", "beta"];

describe("AutoComplete — combobox contract", () => {
  it("exposes a named combobox with expanded/controls state", async () => {
    const wrapper = mount(AutoComplete, { props: { modelValue: "", suggestions } });
    const input = wrapper.find("input");
    expect(input.attributes("role")).toBe("combobox");
    expect(input.attributes("aria-label")).toBe("Suggestions");
    await input.trigger("focus");
    expect(input.attributes("aria-expanded")).toBe("true");
    expect(input.attributes("aria-controls")).toBeTruthy();
  });

  it("moves the active suggestion with arrows (aria-activedescendant) and picks on Enter", async () => {
    const wrapper = mount(AutoComplete, { props: { modelValue: "", suggestions } });
    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.trigger("keydown", { key: "ArrowDown" });
    expect(input.attributes("aria-activedescendant")).toContain("opt-0");
    await input.trigger("keydown", { key: "ArrowDown" });
    expect(input.attributes("aria-activedescendant")).toContain("opt-1");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["alpine"]);
    expect(wrapper.emitted("select")?.at(-1)).toEqual(["alpine"]);
  });

  it("closes on Escape", async () => {
    const wrapper = mount(AutoComplete, { props: { modelValue: "a", suggestions } });
    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.trigger("keydown", { key: "Escape" });
    expect(wrapper.find(".autocomplete__list").exists()).toBe(false);
  });
});
