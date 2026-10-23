// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import CommandMenu from "../src/kit/CommandMenu.vue";
import type { CommandItem } from "../src/kit/types";

const items: CommandItem[] = [
  { id: "new", label: "New File", group: "File", keywords: "create nf" },
  { id: "open", label: "Open Folder", group: "File" },
  { id: "export", label: "Export", keywords: "save-as" },
  { id: "theme", label: "Change Theme", group: "View" },
];

function mountMenu(open = true, itemsToUse = items) {
  const w = mount(CommandMenu, {
    props: { open, items: itemsToUse },
    global: { stubs: { teleport: true } },
  });
  wrappers.push(w);
  return w;
}

/** The input's keydown handler compares e.key case-sensitively; test-utils
 *  dispatches lowercase keys, so dispatch the browser-canonical form. */
function press(input: Element, key: string): void {
  input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

let wrappers: VueWrapper[] = [];
afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
  document.body.innerHTML = "";
});

describe("CommandMenu — open state and filtering", () => {
  it("renders the palette with every item while the query is empty", () => {
    const w = mountMenu();
    expect(w.find(".cmd-menu").exists()).toBe(true);
    expect(w.find('[data-cmd-input]').exists()).toBe(true);
    expect(w.findAll(".cmd-menu__item")).toHaveLength(4);
    expect(w.find(".cmd-menu__empty").exists()).toBe(false);
  });

  it("renders nothing while closed and appears when open flips", async () => {
    const w = mountMenu(false);
    expect(w.find(".cmd-menu").exists()).toBe(false);
    await w.setProps({ open: true });
    expect(w.find(".cmd-menu").exists()).toBe(true);
    await w.setProps({ open: false });
    expect(w.find(".cmd-menu").exists()).toBe(false);
  });

  it("typing filters by label substring, case-insensitively", async () => {
    const w = mountMenu();
    const labels = () => w.findAll(".cmd-menu__label").map((b) => b.text());
    const input = w.find('[data-cmd-input]');
    await input.setValue("new");
    expect(labels()).toEqual(["New File"]);
    await input.setValue("NeW");
    expect(labels()).toEqual(["New File"]);
  });

  it("the query also matches keywords and group", async () => {
    const w = mountMenu();
    const labels = () => w.findAll(".cmd-menu__label").map((b) => b.text());
    const input = w.find('[data-cmd-input]');
    await input.setValue("create"); // keyword on New File
    expect(labels()).toEqual(["New File"]);
    await input.setValue("view"); // group on Change Theme
    expect(labels()).toEqual(["Change Theme"]);
  });

  it("a query with no matches shows the empty state and ignores keys", async () => {
    const w = mountMenu();
    const input = w.find('[data-cmd-input]');
    await input.setValue("zzz-no-match");
    expect(w.findAll(".cmd-menu__item")).toHaveLength(0);
    expect(w.find(".cmd-menu__empty").text()).toBe("No commands match");
    // documented edge: with nothing filtered, Enter/Escape/arrows are no-ops
    press(input.element, "Enter");
    press(input.element, "Escape");
    press(input.element, "ArrowDown");
    expect(w.emitted("select")).toBeUndefined();
    expect(w.emitted("update:open")).toBeUndefined();
  });
});

describe("CommandMenu — keyboard navigation and selection", () => {
  it("arrows move the highlight, wrapping at the ends; Enter selects the active row", async () => {
    const w = mountMenu();
    await w.vm.$nextTick();
    const input = w.find('[data-cmd-input]');
    const rows = () => w.findAll(".cmd-menu__item");
    const activeText = () => w.find(".cmd-menu__item.is-active .cmd-menu__label").text();
    expect(rows()[0].classes()).toContain("is-active");
    press(input.element, "ArrowDown");
    await w.vm.$nextTick();
    expect(activeText()).toBe("Open Folder");
    press(input.element, "ArrowDown");
    await w.vm.$nextTick();
    expect(activeText()).toBe("Export");
    press(input.element, "ArrowUp");
    await w.vm.$nextTick();
    expect(activeText()).toBe("Open Folder");
    // wrap past the top → last row
    press(input.element, "ArrowUp");
    press(input.element, "ArrowUp");
    await w.vm.$nextTick();
    expect(activeText()).toBe("Change Theme");
    press(input.element, "Enter");
    await w.vm.$nextTick();
    expect(w.emitted("select")).toEqual([["theme"]]);
    // wrap past the bottom → first row
    press(input.element, "ArrowDown");
    await w.vm.$nextTick();
    expect(activeText()).toBe("New File");
    press(input.element, "Enter");
    await w.vm.$nextTick();
    expect(w.emitted("select")).toEqual([["theme"], ["new"]]);
    // documented: selecting does not close the palette itself
    expect(w.find(".cmd-menu").exists()).toBe(true);
  });

  it("Enter respects the filtered list, not the full list", async () => {
    const w = mountMenu();
    const input = w.find('[data-cmd-input]');
    await input.setValue("folder"); // filtered: Open Folder only
    press(input.element, "ArrowDown"); // wraps within the filtered list
    await w.vm.$nextTick();
    expect(w.find(".cmd-menu__item.is-active .cmd-menu__label").text()).toBe("Open Folder");
    press(input.element, "Enter");
    await w.vm.$nextTick();
    expect(w.emitted("select")).toEqual([["open"]]);
  });

  it("clicking an item emits select with its id", async () => {
    const w = mountMenu();
    await w.findAll(".cmd-menu__item")[2].trigger("click");
    expect(w.emitted("select")).toEqual([["export"]]);
  });

  it("hovering moves the active highlight", async () => {
    const w = mountMenu();
    await w.findAll(".cmd-menu__item")[3].trigger("mouseenter");
    await w.vm.$nextTick();
    expect(w.find(".cmd-menu__item.is-active .cmd-menu__label").text()).toBe("Change Theme");
  });

  it("Escape emits update:open false", async () => {
    const w = mountMenu();
    press(w.find('[data-cmd-input]').element, "Escape");
    expect(w.emitted("update:open")).toEqual([[false]]);
  });

  it("a mousedown on the backdrop (self) closes the palette", async () => {
    const w = mountMenu();
    await w.find(".cmd-menu").trigger("mousedown");
    expect(w.emitted("update:open")).toEqual([[false]]);
  });
});

describe("CommandMenu — global ⌘K toggle", () => {
  it("cmd/ctrl+k toggles update:open from either state", async () => {
    const w = mountMenu(true);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
    expect(w.emitted("update:open")).toEqual([[false]]);
    await w.setProps({ open: false });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    expect(w.emitted("update:open")).toEqual([[false], [true]]);
  });

  it("other keys do not toggle", async () => {
    const w = mountMenu(true);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", bubbles: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "j", metaKey: true, bubbles: true }));
    expect(w.emitted("update:open")).toBeUndefined();
  });
});
