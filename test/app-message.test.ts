// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppMessage from "../src/kit/AppMessage.vue";

describe("AppMessage — live-region contract", () => {
  it("announces errors assertively (role=alert) and everything else as status", () => {
    const err = mount(AppMessage, { props: { kind: "err" }, slots: { default: "boom" } });
    expect(err.attributes("role")).toBe("alert");
    for (const kind of ["info", "ok", "warn"] as const) {
      const w = mount(AppMessage, { props: { kind }, slots: { default: "note" } });
      expect(w.attributes("role"), kind).toBe("status");
    }
  });

  it("labels the dismiss button and emits close on click", async () => {
    const wrapper = mount(AppMessage, { props: { dismissible: true }, slots: { default: "note" } });
    const btn = wrapper.find("button");
    expect(btn.attributes("aria-label")).toBe("Dismiss");
    await btn.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });
});
