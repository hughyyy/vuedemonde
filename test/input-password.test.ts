// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import InputPassword from "../src/kit/InputPassword.vue";

describe("InputPassword — field naming and reveal toggle", () => {
  it("names the field and exposes the toggle state", async () => {
    const wrapper = mount(InputPassword, { props: { modelValue: "s3cret" } });
    expect(wrapper.find("input").attributes("aria-label")).toBe("Password");
    expect(wrapper.find("input").attributes("type")).toBe("password");
    const toggle = wrapper.find("button");
    expect(toggle.attributes("aria-label")).toBe("Show password");
    await toggle.trigger("click");
    expect(wrapper.find("input").attributes("type")).toBe("text");
    expect(wrapper.find("button").attributes("aria-label")).toBe("Hide password");
    expect(wrapper.find("button").attributes("aria-pressed")).toBe("true");
  });
});
