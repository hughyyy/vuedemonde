// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppTextarea from "../src/kit/AppTextarea.vue";

describe("AppTextarea — message association contract", () => {
  it("wires hint and error text to the control via aria-describedby", () => {
    const hint = mount(AppTextarea, { props: { modelValue: "x", hint: "markdown ok" } });
    const hintId = hint.find(".app-textarea__msg").attributes("id");
    expect(hint.find("textarea").attributes("aria-describedby")).toBe(hintId);

    const err = mount(AppTextarea, { props: { modelValue: "x", error: "too short" } });
    const errId = err.find(".app-textarea__msg").attributes("id");
    expect(err.find("textarea").attributes("aria-describedby")).toBe(errId);
  });

  it("announces errors assertively", () => {
    const wrapper = mount(AppTextarea, { props: { modelValue: "", error: "required" } });
    expect(wrapper.find(".app-textarea__msg").attributes("role")).toBe("alert");
  });
});
