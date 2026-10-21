// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppProgress from "../src/kit/AppProgress.vue";

describe("AppProgress — aria contract", () => {
  it("declares an indeterminate bar WITHOUT aria-valuenow (never the string 'undefined')", () => {
    const wrapper = mount(AppProgress, { props: { value: undefined } });
    expect(wrapper.attributes("role")).toBe("progressbar");
    expect(wrapper.attributes("aria-valuenow")).toBeUndefined();
    expect(wrapper.html()).not.toContain('aria-valuenow="undefined"');
  });

  it("reports the value for a determinate bar, clamped to 0–100", () => {
    const wrapper = mount(AppProgress, { props: { value: 42 } });
    expect(wrapper.attributes("aria-valuenow")).toBe("42");
    const clamped = mount(AppProgress, { props: { value: 150 } });
    expect(clamped.attributes("aria-valuenow")).toBe("100");
  });
});
