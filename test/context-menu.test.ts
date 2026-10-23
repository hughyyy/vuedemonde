// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import ContextMenu from "../src/kit/ContextMenu.vue";
import type { MenuAction } from "../src/kit/types";

const items: MenuAction[] = [
  { id: "rename", label: "Rename", icon: "edit" },
  { id: "duplicate", label: "Duplicate" },
  { id: "remove", label: "Delete", danger: true },
  { id: "locked", label: "Locked", disabled: true },
];

/** ContextMenu renders its panel through a Teleport; stubbing keeps the panel
 *  in the wrapper so assertions stay on the wrapper. */
function mountMenu(itemsToUse = items) {
  return mount(ContextMenu, {
    props: { items: itemsToUse },
    slots: { default: "<button class='target'>Right-click me</button>" },
    global: { stubs: { teleport: true } },
  });
}

let wrappers: VueWrapper[] = [];
afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
  document.body.innerHTML = "";
});

function panel(w: VueWrapper) {
  return w.find(".context-menu__panel");
}

function openAt(w: VueWrapper, clientX: number, clientY: number): void {
  w.element.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX, clientY }));
}

describe("ContextMenu — opening and placement", () => {
  it("right-click on the target opens a role=menu panel and prevents default", async () => {
    const w = mountMenu();
    wrappers.push(w);
    expect(panel(w).exists()).toBe(false);
    const ev = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 60,
      clientY: 80,
    });
    w.element.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    await w.vm.$nextTick();
    expect(panel(w).exists()).toBe(true);
    expect(panel(w).attributes("role")).toBe("menu");
    expect(panel(w).findAll(".context-menu__item")).toHaveLength(items.length);
  });

  it("clamps left/top to the viewport minus the panel size", async () => {
    const w = mountMenu();
    wrappers.push(w);
    const expectedLeft = window.innerWidth - 200;
    openAt(w, window.innerWidth + 500, window.innerHeight + 500);
    await w.vm.$nextTick();
    const style = panel(w).attributes("style") ?? "";
    expect(style).toContain(`left: ${expectedLeft}px`);
    expect(style).toContain(`top: ${window.innerHeight - 220}px`);
  });

  it("clamps left to a 4px edge margin near the left side", async () => {
    const w = mountMenu();
    wrappers.push(w);
    openAt(w, 2, 60); // clientX < 4 → clamped to 4
    await w.vm.$nextTick();
    expect(panel(w).attributes("style")).toContain("left: 4px");
  });
});

describe("ContextMenu — item interaction", () => {
  it("clicking an enabled item emits select with its id and closes", async () => {
    const w = mountMenu();
    wrappers.push(w);
    openAt(w, 50, 50);
    await w.vm.$nextTick();
    await panel(w).findAll(".context-menu__item")[0].trigger("click");
    expect(w.emitted("select")).toEqual([["rename"]]);
    expect(panel(w).exists()).toBe(false);
  });

  it("clicking a disabled item emits nothing and keeps the menu open", async () => {
    const w = mountMenu();
    wrappers.push(w);
    openAt(w, 50, 50);
    await w.vm.$nextTick();
    await panel(w).find(".is-disabled").trigger("click");
    expect(w.emitted("select")).toBeUndefined();
    expect(panel(w).exists()).toBe(true);
  });

  it("danger items render the is-danger style", async () => {
    const w = mountMenu();
    wrappers.push(w);
    openAt(w, 50, 50);
    await w.vm.$nextTick();
    const labels = panel(w).findAll(".context-menu__item").map((b) => b.text());
    expect(labels).toEqual(["Rename", "Duplicate", "Delete", "Locked"]);
    expect(panel(w).findAll(".context-menu__item")[2].classes()).toContain("is-danger");
  });
});

describe("ContextMenu — dismissal paths", () => {
  it("Escape on the window closes an open menu", async () => {
    const w = mountMenu();
    wrappers.push(w);
    openAt(w, 50, 50);
    await w.vm.$nextTick();
    // manual dispatch: test-utils sends lowercase keys, this handler is case-sensitive
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await w.vm.$nextTick();
    expect(panel(w).exists()).toBe(false);
  });

  it("mousedown outside closes; mousedown inside the panel does not preempt the click", async () => {
    const w = mountMenu();
    wrappers.push(w);
    openAt(w, 50, 50);
    await w.vm.$nextTick();
    // outside: target not inside the panel
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await w.vm.$nextTick();
    expect(panel(w).exists()).toBe(false);
    // reopen, then mousedown on the item button itself (inside the panel)
    openAt(w, 50, 50);
    await w.vm.$nextTick();
    const btn = panel(w).findAll(".context-menu__item")[1];
    btn.element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await btn.trigger("click");
    // the document mousedown listener ran but the contains() guard kept the
    // menu open long enough for the click handler to fire
    expect(w.emitted("select")).toEqual([["duplicate"]]);
    expect(panel(w).exists()).toBe(false);
  });

  it("scroll and resize close while open and do nothing while closed", async () => {
    const w = mountMenu();
    wrappers.push(w);
    openAt(w, 50, 50);
    await w.vm.$nextTick();
    window.dispatchEvent(new Event("scroll")); // captured on window
    await w.vm.$nextTick();
    expect(panel(w).exists()).toBe(false);
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("scroll"));
    expect(panel(w).exists()).toBe(false); // still closed, no re-open
  });

  it("unmount removes the global listeners: later events are inert", async () => {
    const w = mountMenu();
    openAt(w, 50, 50);
    await w.vm.$nextTick();
    w.unmount();
    // none of these may throw once the listeners are gone
    expect(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new Event("scroll"));
    }).not.toThrow();
  });
});
