// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppTooltip from "../src/kit/AppTooltip.vue";
import BlockUI from "../src/kit/BlockUI.vue";
import ConfirmPopup from "../src/kit/ConfirmPopup.vue";
import Popover from "../src/kit/Popover.vue";

describe("AppTooltip — tooltip is only announced once shown", () => {
  it("keeps the bubble out of the a11y tree until hover/focus", async () => {
    const wrapper = mount(AppTooltip, {
      props: { text: "Delete permanently" },
      slots: { default: "<button>Delete</button>" },
    });
    const bubble = wrapper.find("[role='tooltip']");
    expect(bubble.attributes("aria-hidden")).toBe("true");
    await wrapper.trigger("focusin");
    expect(bubble.attributes("aria-hidden")).toBe("false");
    expect(wrapper.attributes("aria-describedby")).toBe(bubble.attributes("id"));
    await wrapper.trigger("focusout");
    expect(bubble.attributes("aria-hidden")).toBe("true");
  });
});

describe("BlockUI — blocked content is inert", () => {
  it("marks the content subtree inert while blocked", async () => {
    const wrapper = mount(BlockUI, { props: { blocked: true, message: "Saving" }, slots: { default: "<button>Edit</button>" } });
    expect(wrapper.find(".blockui__content").attributes("inert")).toBeDefined();
    expect(wrapper.find(".blockui__mask").attributes("role")).toBe("status");
    await wrapper.setProps({ blocked: false });
    expect(wrapper.find(".blockui__content").attributes("inert")).toBeUndefined();
  });
});

describe("ConfirmPopup / Popover — named dialogs", () => {
  it("announces the confirm panel as a labelled dialog", async () => {
    const wrapper = mount(ConfirmPopup, { props: { message: "Delete this run?" } });
    void (wrapper.vm as unknown as { prompt(): Promise<boolean> }).prompt();
    await wrapper.vm.$nextTick();
    const panel = document.body.querySelector(".confirm-popup__panel");
    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(panel?.getAttribute("aria-label")).toBe("Delete this run?");
  });

  it("names the popover dialog from the label prop", () => {
    mount(Popover, {
      props: { open: true, label: "More actions" },
      slots: { trigger: "<button>More</button>", default: "<p>Export as CSV</p>" },
    });
    const panel = document.body.querySelector(".popover__panel");
    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(panel?.getAttribute("aria-label")).toBe("More actions");
  });
});
