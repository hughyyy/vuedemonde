// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Rating from "../src/kit/Rating.vue";

function mountRating(props: Record<string, unknown> = {}) {
  return mount(Rating, { props: { modelValue: 0, ...props }, global: { stubs: { AppIcon: true } } });
}

describe("Rating — pointer selection", () => {
  it("sets the value on star click", async () => {
    const w = mountRating({ modelValue: 0 });
    await w.findAll(".rating__star")[3].trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([4]);
  });

  it("clicking the active star clears to zero", async () => {
    const w = mountRating({ modelValue: 3 });
    await w.findAll(".rating__star")[2].trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([0]);
  });

  it("lights stars up to the current value", () => {
    const w = mountRating({ modelValue: 2 });
    const stars = w.findAll(".rating__star");
    expect(stars[0].classes()).toContain("is-on");
    expect(stars[1].classes()).toContain("is-on");
    expect(stars[2].classes()).not.toContain("is-on");
  });

  it("readonly mode blocks clicks and disables the buttons", async () => {
    const w = mountRating({ modelValue: 3, readonly: true });
    await w.findAll(".rating__star")[1].trigger("click");
    expect(w.emitted("update:modelValue")).toBeUndefined();
    for (const s of w.findAll(".rating__star")) expect(s.attributes("disabled")).toBeDefined();
  });
});

describe("Rating — keyboard + semantics", () => {
  it("arrow keys adjust the value within [0, max] via the slider role", async () => {
    const w = mountRating({ modelValue: 3 });
    await w.trigger("keydown.arrow-right");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([4]);
    await w.trigger("keydown.arrow-left");
    await w.trigger("keydown.arrow-left");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([2]);
  });

  it("arrows clamp at the bounds", async () => {
    const w = mountRating({ modelValue: 5 });
    await w.trigger("keydown.arrow-right");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([5]);
    const w2 = mountRating({ modelValue: 0 });
    await w2.trigger("keydown.arrow-left");
    expect(w2.emitted("update:modelValue")!.at(-1)).toEqual([0]);
  });

  it("readonly ignores the arrow keys too", async () => {
    const w = mountRating({ modelValue: 2, readonly: true });
    await w.trigger("keydown.arrow-right");
    expect(w.emitted("update:modelValue")).toBeUndefined();
  });

  it("exposes slider semantics and per-star labels", () => {
    const w = mountRating({ modelValue: 2, max: 3 });
    const root = w.find(".rating");
    expect(root.attributes("role")).toBe("slider");
    expect(root.attributes("aria-valuemin")).toBe("0");
    expect(root.attributes("aria-valuemax")).toBe("3");
    expect(root.attributes("aria-valuenow")).toBe("2");
    expect(w.findAll(".rating__star")[0].attributes("aria-label")).toBe("1 star");
    expect(w.findAll(".rating__star")[2].attributes("aria-label")).toBe("3 stars");
  });

  it("a custom max renders that many stars", () => {
    const w = mountRating({ modelValue: 0, max: 10 });
    expect(w.findAll(".rating__star")).toHaveLength(10);
  });
});
