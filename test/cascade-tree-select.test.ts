// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import CascadeSelect from "../src/kit/CascadeSelect.vue";
import TreeSelect from "../src/kit/TreeSelect.vue";
import type { TreeNode } from "../src/kit/types";

const cascades = [
  { value: "sys", label: "Systems", children: [{ value: "cad", label: "CAD" }] },
  { value: "web", label: "Web", children: [{ value: "fe", label: "Frontend", children: [{ value: "react", label: "React" }] }] },
];

const treeNodes: TreeNode[] = [
  { id: "sys", label: "Systems", children: [{ id: "cad", label: "CAD" }, { id: "eda", label: "EDA" }] },
  { id: "web", label: "Web", children: [{ id: "fe", label: "Frontend" }] },
  { id: "blocked", label: "Blocked", disabled: true, children: [{ id: "b1", label: "B1" }] },
];

const mountCascade = (props: { options?: typeof cascades; modelValue?: string } = {}) =>
  mount(CascadeSelect, {
    props: { options: props.options ?? cascades, modelValue: props.modelValue ?? "" },
    global: { stubs: { teleport: true } },
  });

const mountTreeSelect = (props: { nodes?: TreeNode[]; modelValue?: string } = {}) =>
  mount(TreeSelect, {
    props: { nodes: props.nodes ?? treeNodes, modelValue: props.modelValue ?? "" },
    global: { stubs: { teleport: true } },
  });

const itemBy = (w: VueWrapper, label: string) =>
  w.findAll(".cascade-select__item").find((i) => i.text().includes(label));

const rowBy = (w: VueWrapper, label: string) =>
  w.findAll(".tree-item__row").find((r) => r.text().includes(label));

describe("CascadeSelect — panel navigation", () => {
  it("opens to root options; clicking a parent drills into its children", async () => {
    const w = mountCascade();
    await w.find(".cascade-select__trigger").trigger("click");

    expect(w.findAll(".cascade-select__item")).toHaveLength(2);
    expect(w.text()).toContain("Systems");
    expect(w.text()).toContain("Web");
    // no breadcrumb yet: nothing has been selected
    expect(w.find(".cascade-select__crumbs").exists()).toBe(false);

    await itemBy(w, "Systems")!.trigger("click");
    expect(w.findAll(".cascade-select__item")).toHaveLength(1);
    expect(itemBy(w, "CAD")).toBeDefined();
    expect(w.text()).not.toContain("Web");
  });

  it("selecting a leaf emits its value, labels the trigger, and closes", async () => {
    const w = mountCascade();
    await w.find(".cascade-select__trigger").trigger("click");
    await itemBy(w, "Systems")!.trigger("click");
    await itemBy(w, "CAD")!.trigger("click");

    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["cad"]);
    expect(w.find(".cascade-select__panel").exists()).toBe(false);
    expect(w.find(".cascade-select__trigger").text()).toContain("Systems / CAD");
  });

  it("breadcrumb crumbs return to a previous level after reopening", async () => {
    const w = mountCascade({ modelValue: "cad" });
    await w.find(".cascade-select__trigger").trigger("click");

    // bound value → path known: crumbs show [Systems, CAD]; level resumes to root (leaf has no children)
    expect(w.findAll(".cascade-select__crumbs button").map((b) => b.text())).toEqual(["Systems", "CAD"]);
    expect(w.findAll(".cascade-select__item")).toHaveLength(2);

    // first crumb → back to the root list
    await w.findAll(".cascade-select__crumbs button")[0]!.trigger("click");
    expect(itemBy(w, "Web")).toBeDefined();

    // deep path: Web → Frontend → React
    await itemBy(w, "Web")!.trigger("click");
    await itemBy(w, "Frontend")!.trigger("click");
    expect(itemBy(w, "React")!.classes()).toContain("is-leaf");
    await itemBy(w, "React")!.trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["react"]);
    expect(w.find(".cascade-select__panel").exists()).toBe(false);
  });

  it("a middle crumb restores its level when the path is deeper", async () => {
    const w = mountCascade({ modelValue: "react" });
    await w.find(".cascade-select__trigger").trigger("click");
    expect(w.findAll(".cascade-select__crumbs button").map((b) => b.text())).toEqual(["Web", "Frontend", "React"]);

    // crumb "Frontend" (index 1) → level = Frontend's siblings under Web
    await w.findAll(".cascade-select__crumbs button")[1]!.trigger("click");
    expect(w.findAll(".cascade-select__item")).toHaveLength(1);
    expect(itemBy(w, "Frontend")).toBeDefined();
  });

  it("empty options open with no items and no crash", async () => {
    const w = mountCascade({ options: [] });
    await w.find(".cascade-select__trigger").trigger("click");
    expect(w.find(".cascade-select__panel").exists()).toBe(true);
    expect(w.findAll(".cascade-select__item")).toHaveLength(0);
  });

  it("shows the placeholder when no value is known and no pick was made", () => {
    const w = mountCascade({ modelValue: "nope" });
    expect(w.find(".cascade-select__trigger").text()).toBe("Select…");
  });
});

describe("TreeSelect — panel behavior", () => {
  it("trigger shows the bound node label, or the placeholder", () => {
    const withId = mountTreeSelect({ modelValue: "cad" });
    expect(withId.find(".tree-select__value").text()).toBe("CAD");

    const unknown = mountTreeSelect({ modelValue: "nope" });
    expect(unknown.find(".tree-select__value").text()).toBe("Select…");
  });

  it("opens an expand-all tree; selecting a node emits and closes", async () => {
    const w = mountTreeSelect();
    await w.find(".tree-select__trigger").trigger("click");
    expect(w.find(".tree-select__panel").exists()).toBe(true);
    // expand-all → children of every level are visible
    expect(w.text()).toContain("CAD");
    expect(w.text()).toContain("Frontend");

    await rowBy(w, "CAD")!.trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["cad"]);
    expect(w.find(".tree-select__panel").exists()).toBe(false);
  });

  it("nodes can be collapsed inside the panel", async () => {
    const w = mountTreeSelect();
    await w.find(".tree-select__trigger").trigger("click");
    expect(w.text()).toContain("CAD");

    await w.find('[aria-label="Collapse"]').trigger("click"); // fold Systems
    expect(w.text()).not.toContain("CAD");
    expect(w.text()).toContain("Frontend"); // Web is untouched
  });

  it("disabled nodes are inert to selection but remain expandable", async () => {
    const w = mountTreeSelect();
    await w.find(".tree-select__trigger").trigger("click");

    expect(w.text()).toContain("B1"); // expand-all shows children of the disabled node
    await rowBy(w, "Blocked")!.trigger("click");
    expect(w.emitted("update:modelValue")).toBeUndefined();
    expect(w.find(".tree-select__panel").exists()).toBe(true); // still open
  });

  it("empty tree opens with no rows and no crash", async () => {
    const w = mountTreeSelect({ nodes: [] });
    await w.find(".tree-select__trigger").trigger("click");
    expect(w.find(".tree-select__panel").exists()).toBe(true);
    expect(w.findAll(".tree-item__row")).toHaveLength(0);
  });
});
