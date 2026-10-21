// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import FileUpload from "../src/kit/FileUpload.vue";

describe("FileUpload — zone contract", () => {
  it("makes the drop zone keyboard-operable and the native input inert", () => {
    const wrapper = mount(FileUpload);
    const zone = wrapper.find(".file-upload__zone");
    expect(zone.attributes("role")).toBe("button");
    expect(zone.attributes("tabindex")).toBe("0");
    const native = wrapper.find("input");
    expect(native.attributes("tabindex")).toBe("-1");
    expect(native.attributes("aria-hidden")).toBe("true");
  });

  it("removes listed files via labelled buttons", async () => {
    const file = new File(["x"], "report.pdf", { type: "application/pdf" });
    const wrapper = mount(FileUpload);
    await wrapper.vm.$nextTick();
    // simulate the change path through the internal ref list
    (wrapper.vm as unknown as { raw: unknown[] }).raw = [file];
    await wrapper.vm.$nextTick();
    const btn = wrapper.find("button");
    expect(btn.attributes("aria-label")).toBe("Remove report.pdf");
    await btn.trigger("click");
    expect(wrapper.find(".file-upload__file").exists()).toBe(false);
  });
});
