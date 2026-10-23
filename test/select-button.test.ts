// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import SelectButton from "../src/kit/SelectButton.vue";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", disabled: true },
];

describe("SelectButton — single mode", () => {
  it("shows the active option with aria-pressed and emits on click", async () => {
    const w = mount(SelectButton, { props: { options, modelValue: "a", multiple: false } });
    expect(w.findAll(".select-button__item")[0].attributes("aria-pressed")).toBe("true");
    expect(w.findAll(".select-button__item")[0].classes()).toContain("is-active");
    expect(w.findAll(".select-button__item")[1].attributes("aria-pressed")).toBe("false");
    await w.findAll(".select-button__item")[1].trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["b"]);
  });

  it("re-picking the active option re-emits the same value (single mode)", async () => {
    const w = mount(SelectButton, { props: { options, modelValue: "a" } });
    await w.findAll(".select-button__item")[0].trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["a"]);
  });
});

describe("SelectButton — multiple mode", () => {
  it("toggles values in the array", async () => {
    let value: string[] = ["a"];
    const w = mount(SelectButton, { props: { options, modelValue: value, multiple: true } });
    await w.findAll(".select-button__item")[1].trigger("click"); // add b
    value = w.emitted("update:modelValue")!.at(-1)![0] as string[];
    expect(value).toEqual(["a", "b"]);
    await w.setProps({ modelValue: value });
    await w.findAll(".select-button__item")[0].trigger("click"); // remove a
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([["b"]]);
  });
});

describe("SelectButton — disabled options", () => {
  it("disabled options render inert and never emit", async () => {
    const w = mount(SelectButton, { props: { options, modelValue: "a" } });
    const c = w.findAll(".select-button__item")[2];
    expect(c.attributes("disabled")).toBeDefined();
    expect(c.classes()).toContain("is-disabled");
    await c.trigger("click");
    expect(w.emitted("update:modelValue")).toBeUndefined();

    const wm = mount(SelectButton, { props: { options, modelValue: ["a"], multiple: true } });
    await wm.findAll(".select-button__item")[2].trigger("click");
    expect(wm.emitted("update:modelValue")).toBeUndefined();
  });

  it("a selected-then-disabled value stays active and visible (no crash)", () => {
    const w = mount(SelectButton, { props: { options, modelValue: ["c"], multiple: true } });
    expect(w.findAll(".select-button__item")[2].classes()).toContain("is-active");
  });
});
