// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import Menubar from "../src/kit/Menubar.vue";
import MegaMenu from "../src/kit/MegaMenu.vue";
import TieredMenu from "../src/kit/TieredMenu.vue";
import type { MegaItem, MenubarItem, TieredItem } from "../src/kit/types";

const menubarItems: MenubarItem[] = [
  {
    id: "file",
    label: "File",
    children: [
      { id: "new", label: "New" },
      { id: "prune", label: "Delete All", danger: true },
      // disabled is part of MenuAction but Menubar renders no disabled state
      { id: "disabled-child", label: "Hidden Option", disabled: true },
    ],
  },
  { id: "edit", label: "Edit" }, // leaf root renders directly
];

const megaItems: MegaItem[] = [
  {
    id: "products",
    label: "Products",
    columns: [
      { title: "Tools", items: [{ id: "tool-a", label: "Tool A" }, { id: "tool-b", label: "Tool B" }] },
      { items: [{ id: "plain", label: "Plain Item" }] },
    ],
  },
  { id: "help", label: "Help" },
];

const tieredItems: TieredItem[] = [
  {
    id: "open",
    label: "Open",
    children: [
      { id: "open-file", label: "Open File" },
      { id: "open-folder", label: "Open Folder", danger: true },
    ],
  },
  { id: "save", label: "Save" },
  { id: "del", label: "Delete", danger: true },
  { id: "locked", label: "Locked", disabled: true },
];

/** All three menus teleport their panels; stubbing keeps them in the wrapper. */
const teleportStub = { teleport: true };

let wrappers: VueWrapper[] = [];
afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
  document.body.innerHTML = "";
});

function pressEscape(target: EventTarget): void {
  // manual dispatch: test-utils sends lowercase keys, handlers are case-sensitive
  target.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
}

describe("Menubar — popover-based submenus", () => {
  function mountBar() {
    const w = mount(Menubar, { props: { items: menubarItems }, global: { stubs: teleportStub } });
    wrappers.push(w);
    return w;
  }

  it("clicking a root trigger toggles its panel open and closed", async () => {
    const w = mountBar();
    const trigger = w.findAll(".menubar__root")[0];
    expect(w.find(".menubar__panel").exists()).toBe(false);
    await trigger.trigger("click");
    expect(w.find(".menubar__panel").exists()).toBe(true);
    expect(w.find(".menubar__panel").text()).toContain("New");
    await trigger.trigger("click");
    expect(w.find(".menubar__panel").exists()).toBe(false);
  });

  it("clicking a panel item emits select with the item id", async () => {
    const w = mountBar();
    await w.findAll(".menubar__root")[0].trigger("click");
    await w.findAll(".menubar__item")[0].trigger("click");
    expect(w.emitted("select")).toEqual([["new"]]);
    // documented: Menubar does not auto-close after selecting — the menu stays
    // open until an outside mousedown, scroll, resize or Escape
    expect(w.find(".menubar__panel").exists()).toBe(true);
  });

  it("a leaf root item emits select directly without opening a panel", async () => {
    const w = mountBar();
    await w.findAll(".menubar__root")[1].trigger("click");
    expect(w.emitted("select")).toEqual([["edit"]]);
    expect(w.find(".menubar__panel").exists()).toBe(false);
  });

  it("danger children render the is-danger style", async () => {
    const w = mountBar();
    await w.findAll(".menubar__root")[0].trigger("click");
    expect(w.findAll(".menubar__item")[1].classes()).toContain("is-danger");
  });

  it("disabled children are not gated (documented: Menubar ignores MenuAction.disabled)", async () => {
    const w = mountBar();
    await w.findAll(".menubar__root")[0].trigger("click");
    const disabledChild = w.findAll(".menubar__item")[2];
    expect(disabledChild.attributes("disabled")).toBeUndefined();
    await disabledChild.trigger("click");
    expect(w.emitted("select")).toEqual([["disabled-child"]]);
  });

  it("Escape closes the open panel", async () => {
    const w = mountBar();
    await w.findAll(".menubar__root")[0].trigger("click");
    pressEscape(w.find(".menubar__panel").element);
    await w.vm.$nextTick();
    expect(w.find(".menubar__panel").exists()).toBe(false);
  });

  it("an outside mousedown closes the open panel", async () => {
    const w = mountBar();
    await w.findAll(".menubar__root")[0].trigger("click");
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await w.vm.$nextTick();
    expect(w.find(".menubar__panel").exists()).toBe(false);
  });

  it("two instances keep independent open state", async () => {
    const a = mountBar();
    const b = mountBar();
    await a.findAll(".menubar__root")[0].trigger("click");
    expect(a.find(".menubar__panel").exists()).toBe(true);
    expect(b.find(".menubar__panel").exists()).toBe(false);
    await b.findAll(".menubar__root")[0].trigger("click");
    expect(b.find(".menubar__panel").exists()).toBe(true);
    // closing a leaves b open
    await a.findAll(".menubar__root")[0].trigger("click");
    expect(a.find(".menubar__panel").exists()).toBe(false);
    expect(b.find(".menubar__panel").exists()).toBe(true);
  });
});

describe("MegaMenu — wide multi-column panel", () => {
  function mountMega() {
    const w = mount(MegaMenu, { props: { items: megaItems }, global: { stubs: teleportStub } });
    wrappers.push(w);
    return w;
  }

  it("clicking a root with columns opens the panel with column titles and items", async () => {
    const w = mountMega();
    await w.findAll(".mega__root")[0].trigger("click");
    expect(w.find(".mega__panel").exists()).toBe(true);
    expect(w.find(".mega__col-title").text()).toBe("Tools");
    expect(w.findAll(".mega__item").map((b) => b.text())).toEqual(["Tool A", "Tool B", "Plain Item"]);
  });

  it("clicking a column item emits select with its id", async () => {
    const w = mountMega();
    await w.findAll(".mega__root")[0].trigger("click");
    await w.findAll(".mega__item")[1].trigger("click");
    expect(w.emitted("select")).toEqual([["tool-b"]]);
  });

  it("a leaf root emits select directly without a panel", async () => {
    const w = mountMega();
    await w.findAll(".mega__root")[1].trigger("click");
    expect(w.emitted("select")).toEqual([["help"]]);
    expect(w.find(".mega__panel").exists()).toBe(false);
  });

  it("Escape and outside mousedown close the panel", async () => {
    const w = mountMega();
    await w.findAll(".mega__root")[0].trigger("click");
    pressEscape(w.find(".mega__panel").element);
    await w.vm.$nextTick();
    expect(w.find(".mega__panel").exists()).toBe(false);
    await w.findAll(".mega__root")[0].trigger("click");
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await w.vm.$nextTick();
    expect(w.find(".mega__panel").exists()).toBe(false);
  });

  it("two instances keep independent open state", async () => {
    const a = mountMega();
    const b = mountMega();
    await a.findAll(".mega__root")[0].trigger("click");
    expect(a.find(".mega__panel").exists()).toBe(true);
    expect(b.find(".mega__panel").exists()).toBe(false);
  });
});

describe("TieredMenu — nested submenus", () => {
  function mountTiered() {
    const w = mount(TieredMenu, {
      props: { items: tieredItems },
      slots: { default: "<button class='tiered-trigger'>Menu</button>" },
      global: { stubs: teleportStub },
    });
    wrappers.push(w);
    return w;
  }

  function triggerBtn(w: VueWrapper) {
    return w.find('span[role="button"]');
  }

  it("clicking the trigger toggles the role=menu panel", async () => {
    const w = mountTiered();
    expect(w.find(".tiered__panel").exists()).toBe(false);
    await triggerBtn(w).trigger("click");
    expect(w.find(".tiered__panel").attributes("role")).toBe("menu");
    expect(w.findAll(".tiered__panel .tiered__item").length).toBeGreaterThan(0);
    await triggerBtn(w).trigger("click");
    expect(w.find(".tiered__panel").exists()).toBe(false);
  });

  it("Enter on the trigger opens the menu (keyboard path)", async () => {
    const w = mountTiered();
    await triggerBtn(w).trigger("keydown.enter");
    await w.vm.$nextTick();
    expect(w.find(".tiered__panel").exists()).toBe(true);
  });

  it("clicking a leaf item emits select and closes", async () => {
    const w = mountTiered();
    await triggerBtn(w).trigger("click");
    await w.findAll(".tiered__panel .tiered__item")[1].trigger("click"); // Save
    expect(w.emitted("select")).toEqual([["save"]]);
    expect(w.find(".tiered__panel").exists()).toBe(false);
  });

  it("an item with children opens a fly-out submenu; Back returns to the root", async () => {
    const w = mountTiered();
    await triggerBtn(w).trigger("click");
    await w.findAll(".tiered__panel .tiered__item")[0].trigger("click"); // Open
    expect(w.find(".tiered__sub").exists()).toBe(true);
    expect(w.find(".tiered__sub").text()).toContain("Open File");
    await w.find(".tiered__back").trigger("click");
    expect(w.find(".tiered__sub").exists()).toBe(false);
    expect(w.find(".tiered__panel").exists()).toBe(true); // root stays open
  });

  it("choosing a submenu item emits its id and closes", async () => {
    const w = mountTiered();
    await triggerBtn(w).trigger("click");
    await w.findAll(".tiered__panel .tiered__item")[0].trigger("click"); // Open
    const subItems = w.findAll(".tiered__sub .tiered__item:not(.tiered__back)");
    expect(subItems).toHaveLength(2);
    await subItems[1].trigger("click"); // Open Folder
    expect(w.emitted("select")).toEqual([["open-folder"]]);
    expect(w.find(".tiered__panel").exists()).toBe(false);
    expect(w.find(".tiered__sub").exists()).toBe(false);
  });

  it("disabled items are inert: no select, menu stays open", async () => {
    const w = mountTiered();
    await triggerBtn(w).trigger("click");
    const locked = w.findAll(".tiered__panel .tiered__item")[3]; // Locked
    expect(locked.classes()).toContain("is-disabled");
    await locked.trigger("click");
    expect(w.emitted("select")).toBeUndefined();
    expect(w.find(".tiered__panel").exists()).toBe(true);
  });

  it("danger items render the is-danger style", async () => {
    const w = mountTiered();
    await triggerBtn(w).trigger("click");
    expect(w.findAll(".tiered__panel .tiered__item")[2].classes()).toContain("is-danger");
    await w.findAll(".tiered__panel .tiered__item")[0].trigger("click");
    expect(w.find(".tiered__sub .tiered__item.is-danger").exists()).toBe(true); // Open Folder
  });

  it("Escape closes and an outside mousedown closes", async () => {
    const w = mountTiered();
    await triggerBtn(w).trigger("click");
    pressEscape(w.find(".tiered__panel").element);
    await w.vm.$nextTick();
    expect(w.find(".tiered__panel").exists()).toBe(false);
    await triggerBtn(w).trigger("click");
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await w.vm.$nextTick();
    expect(w.find(".tiered__panel").exists()).toBe(false);
  });

  it("two instances keep independent open state", async () => {
    const a = mountTiered();
    const b = mountTiered();
    await triggerBtn(a).trigger("click");
    expect(a.find(".tiered__panel").exists()).toBe(true);
    expect(b.find(".tiered__panel").exists()).toBe(false);
    await triggerBtn(b).trigger("click");
    expect(b.find(".tiered__panel").exists()).toBe(true);
  });
});
