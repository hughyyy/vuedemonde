// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import Dock from "../src/kit/Dock.vue";
import Drawer from "../src/kit/Drawer.vue";
import type { DockItem } from "../src/kit/types";

const dockItems: DockItem[] = [
  { id: "finder", label: "Finder", icon: "folder" },
  { id: "inbox", label: "Inbox", icon: "inbox" },
];

let wrappers: VueWrapper[] = [];
afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
  document.body.innerHTML = "";
});

function esc(): void {
  // manual dispatch: the Drawer handler compares e.key === "Escape" case-sensitively
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
}

describe("Dock — icon bar", () => {
  it("renders an item button per DockItem with its label", () => {
    const w = mount(Dock, { props: { items: dockItems } });
    wrappers.push(w);
    expect(w.find('[role="toolbar"]').exists()).toBe(true);
    const buttons = w.findAll(".dock__btn");
    expect(buttons).toHaveLength(2);
    expect(buttons[0].attributes("aria-label")).toBe("Finder");
    expect(buttons[1].attributes("aria-label")).toBe("Inbox");
  });

  it("clicking an item emits select with its id", async () => {
    const w = mount(Dock, { props: { items: dockItems } });
    wrappers.push(w);
    await w.findAll(".dock__btn")[1].trigger("click");
    expect(w.emitted("select")).toEqual([["inbox"]]);
  });

  it("no items renders an empty toolbar without error", () => {
    const w = mount(Dock, { props: { items: [] } });
    wrappers.push(w);
    expect(w.find('[role="toolbar"]').exists()).toBe(true);
    expect(w.findAll(".dock__btn")).toHaveLength(0);
  });

  it("documented: DockItem has no disabled or active affordance — all buttons emit", async () => {
    const w = mount(Dock, { props: { items: dockItems } });
    wrappers.push(w);
    const buttons = w.findAll(".dock__btn");
    expect(buttons[0].attributes("disabled")).toBeUndefined();
    await buttons[0].trigger("click");
    expect(w.emitted("select")).toEqual([["finder"]]);
  });
});

describe("Drawer — panel lifecycle and close paths", () => {
  function mountDrawer(overrides: Record<string, unknown> = {}) {
    const w = mount(Drawer, {
      props: { open: true, title: "Settings", ...overrides },
      slots: { default: "<p>drawer body</p>" },
      global: { stubs: { teleport: true } },
    });
    wrappers.push(w);
    return w;
  }

  it("open renders the panel with dialog semantics and the title", () => {
    const w = mountDrawer();
    const panel = w.find(".drawer__panel.is-left");
    expect(panel.exists()).toBe(true);
    expect(panel.attributes("role")).toBe("dialog");
    expect(panel.attributes("aria-modal")).toBe("true");
    expect(panel.attributes("aria-label")).toBe("Settings");
    expect(w.find(".drawer__title").text()).toBe("Settings");
    expect(w.find(".drawer__body").text()).toBe("drawer body");
    expect(w.find(".drawer__backdrop").exists()).toBe(true);
  });

  it("closed renders nothing", () => {
    const w = mountDrawer({ open: false });
    expect(w.find(".drawer").exists()).toBe(false);
  });

  it("mousedown on the backdrop emits close", async () => {
    const w = mountDrawer();
    await w.find(".drawer__backdrop").trigger("mousedown");
    expect(w.emitted("close")).toHaveLength(1);
  });

  it("the close button emits close", async () => {
    const w = mountDrawer();
    expect(w.find(".drawer__close").attributes("aria-label")).toBe("Close");
    await w.find(".drawer__close").trigger("click");
    expect(w.emitted("close")).toHaveLength(1);
  });

  it("Escape on the window emits close", async () => {
    const w = mountDrawer();
    esc();
    await w.vm.$nextTick();
    expect(w.emitted("close")).toHaveLength(1);
  });

  it("documented: the Escape listener is not gated on open — it emits close even while closed", async () => {
    const w = mountDrawer({ open: false });
    esc();
    await w.vm.$nextTick();
    expect(w.emitted("close")).toHaveLength(1);
  });

  it("no title hides the header and falls back to the default aria-label", () => {
    const w = mountDrawer({ title: undefined });
    expect(w.find(".drawer__head").exists()).toBe(false);
    expect(w.find(".drawer__panel").attributes("aria-label")).toBe("Drawer");
  });
});

describe("Drawer — side and size variants", () => {
  it("size maps to width for left/right drawers", () => {
    const w = mount(Drawer, {
      props: { open: true, side: "right", size: 240 },
      global: { stubs: { teleport: true } },
    });
    wrappers.push(w);
    const panel = w.find(".drawer__panel");
    expect(panel.classes()).toContain("is-right");
    expect(panel.attributes("style")).toContain("width: 240px");
  });

  it("size maps to height for top/bottom drawers", () => {
    const w = mount(Drawer, {
      props: { open: true, side: "bottom", size: 96 },
      global: { stubs: { teleport: true } },
    });
    wrappers.push(w);
    const panel = w.find(".drawer__panel");
    expect(panel.classes()).toContain("is-bottom");
    expect(panel.attributes("style")).toContain("height: 96px");
  });

  it("defaults to side left with the default size", () => {
    const w = mount(Drawer, { props: { open: true }, global: { stubs: { teleport: true } } });
    wrappers.push(w);
    expect(w.find(".drawer__panel").classes()).toContain("is-left");
    expect(w.find(".drawer__panel").attributes("style")).toContain("width: 320px");
  });
});
