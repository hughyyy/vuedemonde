// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppToggle from "../src/kit/AppToggle.vue";

describe("AppToggle", () => {
  it("emits the checkbox state on input", async () => {
    const w = mount(AppToggle, { props: { modelValue: false } });
    await w.find('input[type="checkbox"]').setValue(true);
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([true]);
  });

  it("renders a switch role with the checked state mirrored", async () => {
    const w = mount(AppToggle, { props: { modelValue: true } });
    const input = w.find('input[type="checkbox"]');
    expect(input.attributes("role")).toBe("switch");
    expect((input.element as HTMLInputElement).checked).toBe(true);
    await w.setProps({ modelValue: false });
    expect((w.find('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(false);
  });

  it("labels via the label prop and the default slot content", () => {
    const w = mount(AppToggle, { props: { modelValue: false, label: "Dark mode" }, slots: { default: "<span>hint</span>" } });
    expect(w.find(".app-toggle__label").text()).toBe("Dark mode");
    expect(w.text()).toContain("hint");
  });

  it("a disabled toggle cannot change state", async () => {
    const w = mount(AppToggle, { props: { modelValue: false, disabled: true } });
    const input = w.find('input[type="checkbox"]');
    expect(input.attributes("disabled")).toBeDefined();
    await input.setValue(true);
    expect(w.emitted("update:modelValue")).toBeUndefined();
    expect(w.classes()).toContain("is-disabled");
  });

  it("emits true/false transitions faithfully", async () => {
    const w = mount(AppToggle, { props: { modelValue: true } });
    await w.find('input[type="checkbox"]').setValue(false);
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([false]);
  });
});
