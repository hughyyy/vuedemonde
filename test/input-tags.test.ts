// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import InputTags from "../src/kit/InputTags.vue";

describe("InputTags — input keeps an accessible name even with tags present", () => {
  it("defaults to 'Add tag' and honours ariaLabel", () => {
    const withTags = mount(InputTags, { props: { modelValue: ["a", "b"] } });
    expect(withTags.find("input").attributes("aria-label")).toBe("Add tag");
    expect(withTags.find("input").attributes("placeholder")).toBe("");
    const custom = mount(InputTags, { props: { modelValue: [], ariaLabel: "Issue labels" } });
    expect(custom.find("input").attributes("aria-label")).toBe("Issue labels");
  });

  it("removes chips via labelled buttons and commits on Enter", async () => {
    const wrapper = mount(InputTags, { props: { modelValue: ["a"] } });
    const btn = wrapper.find("button");
    expect(btn.attributes("aria-label")).toBe("Remove a");
    await btn.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[]]);
  });
});
