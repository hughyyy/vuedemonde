// @vitest-environment happy-dom
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppVirtualList from "../src/kit/AppVirtualList.vue";

const items = Array.from({ length: 60 }, (_, i) => `item-${i}`);

describe("AppVirtualList — dynamic-height virtualiser", () => {
  it("renders only a window of rows, never the whole list", async () => {
    const wrapper = mount(AppVirtualList, {
      props: { items },
      slots: {
        default:
          '<template #default="{ item, index }"><span class="row">{{ item }}</span><span class="i">{{ index }}</span></template>',
      },
    });
    await wrapper.vm.$nextTick();
    const rows = wrapper.findAll(".app-vlist__item");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(items.length);
  });

  it("exposes the scoped item + index to each rendered row", async () => {
    const wrapper = mount(AppVirtualList, {
      props: { items },
      slots: {
        default:
          '<template #default="{ item, index }"><span class="row">{{ item }}</span><span class="i">{{ index }}</span></template>',
      },
    });
    await wrapper.vm.$nextTick();
    const rows = wrapper.findAll(".row").map((r) => r.text());
    const indexes = wrapper.findAll(".i").map((r) => r.text());
    expect(rows.length).toBe(indexes.length);
    expect(indexes).toEqual(rows.map((_, i) => `${i}`));
    expect(rows.every((row) => row.startsWith("item-"))).toBe(true);
  });
});
