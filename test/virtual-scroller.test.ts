// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VirtualScroller from "../src/kit/VirtualScroller.vue";

const items = Array.from({ length: 2000 }, (_, i) => `item-${i}`);

describe("VirtualScroller (U11) — windows a long flat list", () => {
  it("renders only the visible window, never the whole list (2000 → <30 rows)", async () => {
    const wrapper = mount(VirtualScroller, {
      props: { items, height: 300, itemHeight: 30, overscan: 2 },
    });
    const rows = wrapper.findAll(".vscroll__row");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(30);
    expect(rows[0].attributes("style") ?? "").toContain("top: 0px");
  });

  it("moves the window down when scrolled, staying bounded", async () => {
    const wrapper = mount(VirtualScroller, {
      props: { items, height: 300, itemHeight: 30, overscan: 2 },
    });
    const v = wrapper.find(".vscroll");
    v.element.scrollTop = 60000; // ~item 2000 — the tail of the list
    await v.trigger("scroll");
    const rows = wrapper.findAll(".vscroll__row");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(30);
    const tops = rows.map((r) => Number((r.attributes("style") ?? "").match(/top: (\d+)px/)?.[1] ?? -1));
    expect(tops[0]).toBeGreaterThan(59000); // window moved to the tail
  });

  it("exposes the scoped item + index to each row", () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: ["alpha", "beta", "gamma"], height: 300, itemHeight: 30 },
      slots: { item: '<template #item="{ item, index }"><span class="r">{{ item }}</span><span class="i">{{ index }}</span></template>' },
    });
    expect(wrapper.findAll(".r").map((r) => r.text())).toEqual(["alpha", "beta", "gamma"]);
    expect(wrapper.findAll(".i").map((r) => r.text())).toEqual(["0", "1", "2"]);
  });
});
