// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppDialog from "../src/kit/AppDialog.vue";

describe("AppDialog", () => {
  it("renders the title prop as the dialog heading", () => {
    const wrapper = mount(AppDialog, {
      props: { open: true, title: "Delete run?" },
      global: { stubs: { teleport: true } },
    });
    expect(wrapper.find(".app-dialog__title").text()).toBe("Delete run?");
  });

  it("lets the title slot override the prop for rich headings", () => {
    const wrapper = mount(AppDialog, {
      props: { open: true, title: "Fallback" },
      slots: { title: '<span class="rich">⚠ Needs input</span>' },
      global: { stubs: { teleport: true } },
    });
    const title = wrapper.find(".app-dialog__title");
    expect(title.text()).toBe("⚠ Needs input");
    expect(title.find(".rich").exists()).toBe(true);
  });

  it("closes on Escape", async () => {
    const wrapper = mount(AppDialog, {
      props: { open: true, title: "Esc me" },
      global: { stubs: { teleport: true } },
    });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(wrapper.emitted("close")).toBeTruthy();
  });
});
