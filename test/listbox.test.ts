// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Listbox from "../src/kit/Listbox.vue";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", disabled: true },
  { value: "d", label: "Delta" },
];

describe("Listbox — keyboard navigation contract", () => {
  it("moves the active option with arrows, skipping disabled ones", async () => {
    const wrapper = mount(Listbox, { props: { options, modelValue: "a" } });
    const list = wrapper.find(".listbox__items");
    await list.trigger("keydown", { key: "ArrowDown" });
    expect(list.attributes("aria-activedescendant")).toContain("opt-0"); // first press lands at the top
    await list.trigger("keydown", { key: "ArrowDown" });
    expect(list.attributes("aria-activedescendant")).toContain("opt-1"); // Beta
    await list.trigger("keydown", { key: "ArrowDown" });
    expect(list.attributes("aria-activedescendant")).toContain("opt-3"); // Delta — Gamma skipped
    expect(wrapper.find("li.is-active").text()).toContain("Delta");
  });

  it("commits the active option with Enter but never picks disabled ones", async () => {
    const wrapper = mount(Listbox, { props: { options, modelValue: "a" } });
    const list = wrapper.find(".listbox__items");
    await list.trigger("keydown", { key: "ArrowDown" });
    await list.trigger("keydown", { key: "ArrowDown" });
    await list.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["b"]);
  });

  it("jumps to ends with Home/End", async () => {
    const wrapper = mount(Listbox, { props: { options, modelValue: "a" } });
    const list = wrapper.find(".listbox__items");
    await list.trigger("keydown", { key: "End" });
    expect(list.attributes("aria-activedescendant")).toContain("opt-3");
    await list.trigger("keydown", { key: "Home" });
    expect(list.attributes("aria-activedescendant")).toContain("opt-0");
  });
});
