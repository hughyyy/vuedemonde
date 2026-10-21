// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import AppSearchInput from "../src/kit/AppSearchInput.vue";
import AppOptionInput from "../src/kit/AppOptionInput.vue";

const options = [
  { value: "bob", label: "Bob Smith", hint: "backend" },
  { value: "alice", label: "Alice", hint: "design" },
  { value: "carol" },
];

describe("AppSearchInput — text field with a trailing clear button", () => {
  it("renders an empty input with no clear button", () => {
    const wrapper = mount(AppSearchInput, { props: { modelValue: "" } });
    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.find(".app-search__clear").exists()).toBe(false);
  });

  it("renders the clear × button when a value is present", () => {
    const wrapper = mount(AppSearchInput, { props: { modelValue: "query" } });
    expect(wrapper.find(".app-search__clear").exists()).toBe(true);
  });

  it("emits update:modelValue with '' and refocuses the input on clear", async () => {
    const wrapper = mount(AppSearchInput, { props: { modelValue: "hello" } });
    const inputEl = wrapper.find("input").element;
    const focusSpy = vi.spyOn(inputEl, "focus");
    await wrapper.find(".app-search__clear").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[""]]);
    expect(focusSpy).toHaveBeenCalledTimes(1);
  });
});

describe("AppOptionInput — search box over known options", () => {
  it("filters options case-insensitively over label, value and hint", async () => {
    const wrapper = mount(AppOptionInput, { props: { modelValue: "", options } });

    // label match (case-insensitive substring)
    await wrapper.find("input").setValue("SMITH");
    await wrapper.setProps({ modelValue: "SMITH" });
    expect(wrapper.findAll(".app-opts__label").map((o) => o.text())).toEqual(["Bob Smith"]);

    // hint match
    await wrapper.find("input").setValue("design");
    await wrapper.setProps({ modelValue: "design" });
    expect(wrapper.findAll(".app-opts__label").map((o) => o.text())).toEqual(["Alice"]);

    // value match (label falls back to value)
    await wrapper.find("input").setValue("carol");
    await wrapper.setProps({ modelValue: "carol" });
    expect(wrapper.findAll(".app-opts__label").map((o) => o.text())).toEqual(["carol"]);
  });

  it("emits pick and update:modelValue when a known option is clicked", async () => {
    const wrapper = mount(AppOptionInput, { props: { modelValue: "", options } });
    await wrapper.find("input").setValue("al");
    await wrapper.setProps({ modelValue: "al" });
    const shown = wrapper.findAll(".app-opts__opt");
    expect(wrapper.findAll(".app-opts__label").map((o) => o.text())).toEqual(["Alice"]);
    await shown[0].trigger("click");
    expect(wrapper.emitted("pick")).toEqual([["alice"]]);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["alice"]);
  });

  it("emits update:modelValue but never pick for free text", async () => {
    const wrapper = mount(AppOptionInput, { props: { modelValue: "", options } });
    await wrapper.find("input").setValue("zzz-unknown");
    await wrapper.setProps({ modelValue: "zzz-unknown" });
    expect(wrapper.findAll(".app-opts__opt").length).toBe(0);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["zzz-unknown"]);
    expect(wrapper.emitted("pick")).toBeUndefined();
  });
});
