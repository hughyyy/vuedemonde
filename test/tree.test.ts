// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Tree from "../src/kit/Tree.vue";
import type { TreeNode } from "../src/kit/types";

const nodes: TreeNode[] = [
  {
    id: "a",
    label: "Alpha",
    children: [
      { id: "a1", label: "Alpha 1" },
      { id: "a2", label: "Alpha 2", children: [{ id: "a21", label: "Alpha 2.1" }] },
    ],
  },
  { id: "b", label: "Beta" },
];

describe("Tree — expand/collapse", () => {
  it("renders root items and exposes treeitem roles with levels", () => {
    const w = mount(Tree, { props: { nodes } });
    expect(w.findAll('[role="treeitem"]')).toHaveLength(2);
    expect(w.findAll('[role="treeitem"]')[0].attributes("aria-level")).toBe("1");
  });

  it("children are hidden until the twist is toggled", async () => {
    const w = mount(Tree, { props: { nodes } });
    expect(w.text()).not.toContain("Alpha 1");
    expect(w.find('[aria-label="Expand"]').exists()).toBe(true);
    await w.find('[aria-label="Expand"]').trigger("click");
    expect(w.text()).toContain("Alpha 1");
    expect(w.findAll('[role="treeitem"]')[1].attributes("aria-level")).toBe("2");
    // collapse again
    await w.find('[aria-label="Collapse"]').trigger("click");
    expect(w.text()).not.toContain("Alpha 1");
  });

  it("an item marked expanded starts open and can be folded", async () => {
    const w = mount(Tree, {
      props: { nodes: [{ id: "x", label: "X", expanded: true, children: [{ id: "x1", label: "X1" }] }] },
    });
    expect(w.text()).toContain("X1");
    await w.find('[aria-label="Collapse"]').trigger("click");
    expect(w.text()).not.toContain("X1");
  });

  it("expandAll opens every level and folded overrides it", async () => {
    const w = mount(Tree, { props: { nodes, expandAll: true } });
    expect(w.text()).toContain("Alpha 2.1");
    await w.find('[aria-label="Collapse"]').trigger("click"); // fold Alpha
    expect(w.text()).not.toContain("Alpha 1");
    expect(w.text()).not.toContain("Alpha 2.1");
  });

  it("leaf nodes have no twist button", () => {
    const w = mount(Tree, { props: { nodes } });
    expect(w.findAll(".tree-item__twist")).toHaveLength(1); // only Alpha
  });
});

describe("Tree — selection", () => {
  it("clicking a row emits select with the node id", async () => {
    const w = mount(Tree, { props: { nodes, selectable: true } });
    expect(w.findAll(".tree-item__row")[0].attributes("tabindex")).toBe("0");
    await w.findAll(".tree-item__row")[0].trigger("click");
    expect(w.emitted("select")!.at(-1)).toEqual(["a"]);
  });

  it("keyboard (Enter/Space) selects", async () => {
    const w = mount(Tree, { props: { nodes, selectable: true } });
    await w.findAll(".tree-item__row")[1].trigger("keydown.enter");
    expect(w.emitted("select")!.at(-1)).toEqual(["b"]);
    await w.findAll(".tree-item__row")[1].trigger("keydown.space");
    expect(w.emitted("select")!.at(-1)).toEqual(["b"]);
  });

  it("the selected row carries aria-selected and the selected class", () => {
    const w = mount(Tree, { props: { nodes, selectable: true, selectedId: "b" } });
    expect(w.findAll('[role="treeitem"]')[1].attributes("aria-selected")).toBe("true");
    expect(w.findAll(".tree-item__row")[1].classes()).toContain("is-selected");
    expect(w.findAll('[role="treeitem"]')[0].attributes("aria-selected")).toBeUndefined();
  });

  it("non-selectable mode never emits and has no tabindex", async () => {
    const w = mount(Tree, { props: { nodes } });
    expect(w.findAll(".tree-item__row")[0].attributes("tabindex")).toBeUndefined();
    await w.findAll(".tree-item__row")[0].trigger("click");
    expect(w.emitted("select")).toBeUndefined();
  });
});

describe("Tree — disabled nodes", () => {
  it("disabled items expose aria-disabled and a disabled style", () => {
    const w = mount(Tree, {
      props: { nodes: [{ id: "d", label: "Disabled", disabled: true, children: [{ id: "d1", label: "D1" }] }] },
    });
    expect(w.find('[role="treeitem"]').attributes("aria-disabled")).toBe("true");
    expect(w.find(".tree-item__row").classes()).toContain("is-disabled");
  });

  it("disabled items cannot be selected by click, Enter or Space", async () => {
    const w = mount(Tree, {
      props: { nodes: [{ id: "d", label: "Disabled", disabled: true }], selectable: true },
    });
    await w.find(".tree-item__row").trigger("click");
    await w.find(".tree-item__row").trigger("keydown.enter");
    await w.find(".tree-item__row").trigger("keydown.space");
    expect(w.emitted("select")).toBeUndefined();
  });

  it("disabled items still open their children (disabled ≠ closed)", async () => {
    const w = mount(Tree, {
      props: { nodes: [{ id: "d", label: "Disabled", disabled: true, children: [{ id: "d1", label: "D1" }] }] },
    });
    await w.find('[aria-label="Expand"]').trigger("click");
    expect(w.text()).toContain("D1");
  });
});
