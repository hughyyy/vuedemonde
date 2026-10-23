// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import InputNumber from "../src/kit/InputNumber.vue";

function mountNumber(props: Record<string, unknown> = {}) {
  return mount(InputNumber, {
    props: { modelValue: 0, ...props },
    global: { stubs: { AppIcon: true } },
  });
}

describe("InputNumber — steppers", () => {
  it("increments and decrements by step from the current value", async () => {
    const w = mountNumber({ modelValue: 5 });
    await w.find('[aria-label="Increment"]').trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([6]);
    await w.find('[aria-label="Decrement"]').trigger("click");
    await w.find('[aria-label="Decrement"]').trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([4]);
  });

  it("respects a non-default step", async () => {
    const w = mountNumber({ modelValue: 10, step: 5 });
    await w.find('[aria-label="Increment"]').trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([15]);
  });

  it("clamps at max and min, disabling the matching stepper", async () => {
    const w = mountNumber({ modelValue: 10, min: 0, max: 10 });
    expect(w.find('[aria-label="Increment"]').attributes("disabled")).toBeDefined();
    await w.find('[aria-label="Increment"]').trigger("click");
    expect(w.emitted("update:modelValue")).toBeUndefined();

    const w2 = mountNumber({ modelValue: 0, min: 0, max: 10 });
    expect(w2.find('[aria-label="Decrement"]').attributes("disabled")).toBeDefined();
    await w2.find('[aria-label="Decrement"]').trigger("click");
    expect(w2.emitted("update:modelValue")).toBeUndefined();
  });

  it("a step larger than the remaining headroom still clamps", async () => {
    const w = mountNumber({ modelValue: 9, min: 0, max: 10, step: 5 });
    await w.find('[aria-label="Increment"]').trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([10]);
  });

  it("disabled locks both steppers and the field", () => {
    const w = mountNumber({ modelValue: 5, disabled: true });
    expect(w.find('[aria-label="Increment"]').attributes("disabled")).toBeDefined();
    expect(w.find('[aria-label="Decrement"]').attributes("disabled")).toBeDefined();
    expect(w.find("input").attributes("disabled")).toBeDefined();
  });
});

describe("InputNumber — typed entry", () => {
  it("parses the field on input and clamps", async () => {
    const w = mountNumber({ modelValue: 0, min: 0, max: 10 });
    await w.find("input").setValue("42");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([10]);
  });

  it("a cleared field emits the clamped minimum, not NaN", async () => {
    const w = mountNumber({ modelValue: 3 });
    // happy-dom's number input coerces invalid text to ""; Number("") is 0,
    // which clamps to the min — the field can never emit NaN
    await w.find("input").setValue("");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([0]);
  });

  it("re-renders the field from the bound value", async () => {
    const w = mountNumber({ modelValue: 7 });
    expect((w.find("input").element as HTMLInputElement).value).toBe("7");
    await w.setProps({ modelValue: -2 });
    expect((w.find("input").element as HTMLInputElement).value).toBe("-2");
  });

  it("exposes min/max/step on the native input", () => {
    const w = mountNumber({ modelValue: 0, min: 1, max: 99, step: 2 });
    const input = w.find("input");
    expect(input.attributes("min")).toBe("1");
    expect(input.attributes("max")).toBe("99");
    expect(input.attributes("step")).toBe("2");
  });
});
