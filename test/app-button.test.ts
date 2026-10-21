// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppButton from "../src/kit/AppButton.vue";

describe("AppButton — a11y contract", () => {
  it("an icon-only button exposes its accessible name via aria-label", () => {
    const wrapper = mount(AppButton, { props: { icon: "trash", ariaLabel: "Delete run" } });
    expect(wrapper.attributes("aria-label")).toBe("Delete run");
    expect(wrapper.text()).toBe(""); // no visible label — name comes from aria
  });

  it("falls back to title for the accessible name", () => {
    const wrapper = mount(AppButton, { props: { icon: "trash", title: "Delete run" } });
    expect(wrapper.attributes("aria-label")).toBe("Delete run");
  });

  it("marks the button busy while loading and disables it", () => {
    const wrapper = mount(AppButton, { props: { loading: true } });
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.attributes("disabled")).toBeDefined();
    const idle = mount(AppButton);
    expect(idle.attributes("aria-busy")).toBeUndefined();
  });

  it("is a real button with an explicit type", () => {
    const wrapper = mount(AppButton);
    expect(wrapper.element.tagName).toBe("BUTTON");
    expect(wrapper.attributes("type")).toBe("button");
  });
});
