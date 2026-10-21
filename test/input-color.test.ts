// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import InputColor from "../src/kit/InputColor.vue";

describe("InputColor — labelled swatches, hidden native picker", () => {
  it("names the current-colour button and hides the native input from AT/tab", () => {
    const wrapper = mount(InputColor, { props: { modelValue: "#4f9cf9" } });
    expect(wrapper.find(".input-color__current").attributes("aria-label")).toBe("Current colour: #4f9cf9");
    const native = wrapper.find(".input-color__native");
    expect(native.attributes("tabindex")).toBe("-1");
    expect(native.attributes("aria-hidden")).toBe("true");
    expect(wrapper.find(".input-color__swatch").attributes("aria-label")).toBeTruthy();
  });
});
