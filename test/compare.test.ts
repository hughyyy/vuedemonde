// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import Compare from "../src/kit/Compare.vue";

const host = (w: VueWrapper) => w.find(".compare__handle");

describe("Compare — divider contract", () => {
  it("is a focusable slider handle with live aria values", () => {
    const wrapper = mount(Compare, { props: { modelValue: 0.35 } });
    expect(host(wrapper).attributes("role")).toBe("slider");
    expect(host(wrapper).attributes("aria-valuenow")).toBe("35");
    expect(host(wrapper).attributes("tabindex")).toBe("0");
  });

  it("moves the divider with arrow keys, clamped to 0.1–0.9 and drift-free", async () => {
    const wrapper = mount(Compare, { props: { modelValue: 0.35 } });
    await host(wrapper).trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([0.4]);
    await wrapper.setProps({ modelValue: 0.4 });
    await host(wrapper).trigger("keydown", { key: "ArrowRight" });
    // 0.4 + 0.05 = 0.45 exactly — never 0.45000000000000001
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([0.45]);
    const atMin = mount(Compare, { props: { modelValue: 0.12 } });
    for (let i = 0; i < 3; i++) {
      await host(atMin).trigger("keydown", { key: "ArrowLeft" });
      await atMin.setProps({ modelValue: 0.1 });
    }
    expect(atMin.emitted("update:modelValue")?.at(-1)).toEqual([0.1]);
  });

  it("renders both clips clipped around the divider position", () => {
    const wrapper = mount(Compare, { props: { modelValue: 0.5 } });
    const a = wrapper.find(".compare__clip.is-a").attributes("style") ?? "";
    const b = wrapper.find(".compare__clip.is-b").attributes("style") ?? "";
    expect(a).toContain("inset(0 50% 0 0)");
    expect(b).toContain("inset(0 0 0 50%)");
  });
});
