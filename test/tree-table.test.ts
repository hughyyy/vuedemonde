// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import TreeTable from "../src/kit/TreeTable.vue";
import type { ColumnDef, TreeNode } from "../src/kit/types";

const columns: ColumnDef[] = [
  { field: "name", header: "Name" },
  { field: "status", header: "Status" },
];

const nodes: TreeNode[] = [
  {
    id: "a",
    label: "Alpha",
    row: { status: "open" },
    children: [{ id: "a1", label: "Alpha 1", row: { status: "busy" } }],
  },
  { id: "b", label: "Beta", row: { status: "done" } },
];

const mountTable = (props: { nodes?: TreeNode[]; selectable?: boolean; selectedId?: string; expandAll?: boolean } = {}) =>
  mount(TreeTable, {
    props: { columns, nodes: props.nodes ?? nodes, selectable: props.selectable ?? false, ...props },
  });

const rows = (w: VueWrapper) => w.findAll("tbody tr");

describe("TreeTable — rendering and expansion", () => {
  it("renders column headers and root rows; children are hidden by default", () => {
    const w = mountTable();
    expect(w.findAll("thead th").map((th) => th.text())).toEqual(["Name", "Status"]);
    expect(rows(w)).toHaveLength(2);
    expect(w.text()).not.toContain("Alpha 1");
  });

  it("expanding a parent reveals its children; collapsing hides them again", async () => {
    const w = mountTable();
    expect(w.findAll(".tree-row__twist")).toHaveLength(1); // only Alpha has children

    await w.find('[aria-label="Expand"]').trigger("click");
    expect(rows(w)).toHaveLength(3);
    expect(w.text()).toContain("Alpha 1");

    await w.find('[aria-label="Collapse"]').trigger("click");
    expect(rows(w)).toHaveLength(2);
    expect(w.text()).not.toContain("Alpha 1");
  });

  it("leaf rows have no expander and still render their extra cells", () => {
    const w = mountTable();
    const beta = rows(w)[1]!;
    expect(beta.find(".tree-row__twist").exists()).toBe(false);
    expect(beta.find(".tree-row__label").text()).toBe("Beta");
    expect(beta.find(".tree-row__value").text()).toBe("done");
  });

  it("expandAll opens every level", () => {
    const w = mountTable({ expandAll: true });
    expect(w.text()).toContain("Alpha 1");
    expect(rows(w)).toHaveLength(3);
  });

  it("an empty node list renders headers and no rows without crashing", () => {
    const w = mountTable({ nodes: [] });
    expect(w.findAll("thead th")).toHaveLength(2);
    expect(rows(w)).toHaveLength(0);
  });
});

describe("TreeTable — selection", () => {
  it("row click emits select and the selected row is marked", async () => {
    const w = mountTable({ selectable: true });
    await rows(w)[0]!.trigger("click");
    expect(w.emitted("select")!.at(-1)).toEqual(["a"]);

    await w.find('[aria-label="Expand"]').trigger("click");
    await rows(w)[1]!.trigger("click");
    expect(w.emitted("select")!.at(-1)).toEqual(["a1"]);
  });

  it("the selectedId row carries the selected class", () => {
    const w = mountTable({ selectable: true, selectedId: "b" });
    expect(rows(w)[1]!.classes()).toContain("is-selected");
    expect(rows(w)[0]!.classes()).not.toContain("is-selected");
  });

  it("non-selectable mode never emits select", async () => {
    const w = mountTable();
    await rows(w)[0]!.trigger("click");
    expect(w.emitted("select")).toBeUndefined();
  });

  it("disabled rows are inert and marked", async () => {
    const w = mountTable({
      selectable: true,
      nodes: [
        { id: "d", label: "Down", disabled: true, row: { status: "halted" } },
        { id: "ok", label: "OK", row: { status: "up" } },
      ],
    });
    expect(rows(w)[0]!.classes()).toContain("is-disabled");

    await rows(w)[0]!.trigger("click");
    expect(w.emitted("select")).toBeUndefined();

    await rows(w)[1]!.trigger("click");
    expect(w.emitted("select")!.at(-1)).toEqual(["ok"]);
  });
});
