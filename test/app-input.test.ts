// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppInput from "../src/kit/AppInput.vue";

describe("AppInput — message association contract", () => {
  it("wires hint and error text to the control via aria-describedby", () => {
    const hint = mount(AppInput, { props: { modelValue: "x", hint: "min 3 chars" } });
    const hintId = hint.find(".app-input__msg").attributes("id");
    expect(hint.find("input").attributes("aria-describedby")).toBe(hintId);

    const err = mount(AppInput, { props: { modelValue: "x", error: "too short" } });
    const errId = err.find(".app-input__msg").attributes("id");
    expect(err.find("input").attributes("aria-describedby")).toBe(errId);
  });

  it("announces errors assertively and marks the control invalid", () => {
    const wrapper = mount(AppInput, { props: { modelValue: "", error: "required" } });
    expect(wrapper.find(".app-input__msg").attributes("role")).toBe("alert");
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("omits aria-invalid and describedby when clean", () => {
    const wrapper = mount(AppInput, { props: { modelValue: "ok" } });
    expect(wrapper.find("input").attributes("aria-invalid")).toBeUndefined();
    expect(wrapper.find("input").attributes("aria-describedby")).toBeUndefined();
  });
});
