// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppChip from "../src/kit/AppChip.vue";

describe("AppChip — removable contract", () => {
  it("exposes an accessible remove button and emits close", async () => {
    const wrapper = mount(AppChip, { props: { closable: true }, slots: { default: "beta" } });
    const btn = wrapper.find("button");
    expect(btn.attributes("aria-label")).toBe("Remove");
    await btn.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("renders the label as its own wrapper (ellipsis is CSS-only)", () => {
    const wrapper = mount(AppChip, { slots: { default: "a very long label that must truncate" } });
    expect(wrapper.find(".app-chip__label").text()).toBe("a very long label that must truncate");
  });
});
