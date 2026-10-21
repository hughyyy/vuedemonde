// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Menubar from "../src/kit/Menubar.vue";
import MegaMenu from "../src/kit/MegaMenu.vue";
import TieredMenu from "../src/kit/TieredMenu.vue";
import Carousel from "../src/kit/Carousel.vue";

const withChildren = [{ id: "m", label: "Menu", children: [{ id: "a", label: "Action" }] }];
const withColumns = [{ id: "m", label: "Menu", columns: [{ items: [{ id: "a", label: "Action" }] }] }];
const tiered = [
  { id: "t", label: "Root", children: [{ id: "c", label: "Child" }] },
];

describe("menus — trigger semantics", () => {
  it("announces popup type and tracks open state (Menubar/MegaMenu)", async () => {
    for (const [Comp, items] of [[Menubar, withChildren], [MegaMenu, withColumns]] as const) {
      const wrapper = mount(Comp, { props: { items } });
      const btn = wrapper.find("button");
      expect(btn.attributes("aria-haspopup")).toBe("menu");
      expect(btn.attributes("aria-expanded")).toBe("false");
      await btn.trigger("click");
      await wrapper.vm.$nextTick();
      expect(wrapper.find("button").attributes("aria-expanded")).toBe("true");
    }
  });

  it("announces the tiered trigger state too", async () => {
    const wrapper = mount(TieredMenu, { props: { items: tiered }, slots: { default: "<button>Open</button>" } });
    const trigger = wrapper.find("[role='button']");
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
    await trigger.trigger("click");
    await wrapper.vm.$nextTick();
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });
});

describe("Carousel — region semantics", () => {
  it("declares itself a labelled carousel region", () => {
    const wrapper = mount(Carousel, { props: { items: [1, 2] }, slots: { default: "<p>x</p>" } });
    const root = wrapper.find(".carousel");
    expect(root.attributes("role")).toBe("region");
    expect(root.attributes("aria-roledescription")).toBe("carousel");
    expect(root.attributes("aria-label")).toBe("Carousel");
  });
});
