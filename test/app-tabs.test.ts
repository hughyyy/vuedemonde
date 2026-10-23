// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppTabs from "../src/kit/AppTabs.vue";

const tabs = [
  { id: "one", label: "One" },
  { id: "two", label: "Two" },
  { id: "three", label: "Three", disabled: true },
  { id: "four", label: "Four", badge: "4" },
];

function mountTabs(modelValue = "one") {
  return mount(AppTabs, {
    props: { tabs, modelValue },
    slots: { "panel-one": "<p>p1</p>", "panel-two": "<p>p2</p>" },
  });
}

describe("AppTabs — selection", () => {
  it("renders tab roles and the active pane slot", () => {
    const w = mountTabs();
    expect(w.findAll('[role="tab"]')).toHaveLength(4);
    expect(w.findAll('[role="tab"]')[0].attributes("aria-selected")).toBe("true");
    expect(w.find(".app-tabs__pane").text()).toBe("p1");
  });

  it("clicking a tab emits and the panel follows", async () => {
    const w = mountTabs();
    await w.findAll('[role="tab"]')[1].trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["two"]);
    await w.setProps({ modelValue: "two" });
    expect(w.find(".app-tabs__pane").text()).toBe("p2");
  });

  it("disabled tabs are inert to clicks", async () => {
    const w = mountTabs();
    const tab = w.findAll('[role="tab"]')[2];
    expect(tab.attributes("disabled")).toBeDefined();
    expect(tab.classes()).toContain("is-disabled");
    await tab.trigger("click");
    expect(w.emitted("update:modelValue")).toBeUndefined();
  });

  it("renders badges on tabs that declare them", () => {
    const w = mountTabs();
    expect(w.findAll(".app-tabs__badge")[0].text()).toBe("4");
  });
});

describe("AppTabs — arrow-key navigation", () => {
  /** test-utils sends lowercase keys; dispatch the browser-canonical key. */
  const arrow = (el: Element, key: "ArrowRight" | "ArrowLeft") =>
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

  it("moves right across enabled tabs, skipping disabled ones", async () => {
    const w = mountTabs();
    arrow(w.findAll('[role="tab"]')[0].element, "ArrowRight");
    // skips disabled three: one → two
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["two"]);
    await w.setProps({ modelValue: "two" });
    arrow(w.findAll('[role="tab"]')[1].element, "ArrowRight");
    // two → four (three disabled)
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["four"]);
  });

  it("wraps at the ends", async () => {
    const w = mountTabs();
    await w.setProps({ modelValue: "four" });
    arrow(w.findAll('[role="tab"]')[3].element, "ArrowRight");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["one"]);
    await w.setProps({ modelValue: "one" });
    arrow(w.findAll('[role="tab"]')[0].element, "ArrowLeft");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["four"]);
  });

  it("left/right only; other keys are ignored", async () => {
    const w = mountTabs();
    await w.findAll('[role="tab"]')[0].trigger("keydown.enter");
    await w.findAll('[role="tab"]')[0].trigger("keydown.down");
    await w.findAll('[role="tab"]')[0].trigger("keydown.home");
    expect(w.emitted("update:modelValue")).toBeUndefined();
  });
});
