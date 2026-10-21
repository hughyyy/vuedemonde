// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import InputOtp from "../src/kit/InputOtp.vue";

describe("InputOtp — digit labelling contract", () => {
  it("labels the group and names each digit distinctly", () => {
    const wrapper = mount(InputOtp, { props: { modelValue: "123456" } });
    expect(wrapper.find(".input-otp").attributes("role")).toBe("group");
    expect(wrapper.find(".input-otp").attributes("aria-label")).toBe("One-time code");
    const labels = wrapper.findAll("input").map((i) => i.attributes("aria-label"));
    expect(labels[0]).toBe("Digit 1 of 6");
    expect(labels[5]).toBe("Digit 6 of 6");
    expect(new Set(labels).size).toBe(6);
  });
});
