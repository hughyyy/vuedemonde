// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import PickList from "../src/kit/PickList.vue";
import OrderList from "../src/kit/OrderList.vue";

const sourceItems = ["Alpha", "Beta", "Gamma"];

const mountPick = (props: { source?: unknown[]; target?: unknown[] } = {}) =>
  mount(PickList, { props: { source: props.source ?? sourceItems, target: props.target ?? [] } });

const sourceLis = (w: VueWrapper) => w.findAll(".pick-list__panel")[0]!.findAll(".pick-list__item");
const targetLis = (w: VueWrapper) => w.findAll(".pick-list__panel")[1]!.findAll(".pick-list__item");

describe("PickList — transfers", () => {
  it("renders both panels from its props", () => {
    const w = mountPick({ target: ["Delta"] });
    expect(sourceLis(w).map((li) => li.text())).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(targetLis(w).map((li) => li.text())).toEqual(["Delta"]);
  });

  it("moves selected source items to the target and clears the selection", async () => {
    const w = mountPick();
    await sourceLis(w)[0]!.trigger("click");
    expect(sourceLis(w)[0]!.classes()).toContain("is-selected");

    await w.find('[aria-label="Move selected right"]').trigger("click");
    expect(w.emitted("update:source")!.at(-1)).toEqual([["Beta", "Gamma"]]);
    expect(w.emitted("update:target")!.at(-1)).toEqual([["Alpha"]]);
    // selections reset after the transfer
    expect(w.findAll(".pick-list__item.is-selected")).toHaveLength(0);
  });

  it("transfers a multi-selection in ascending order", async () => {
    const w = mountPick();
    await sourceLis(w)[0]!.trigger("click");
    await sourceLis(w)[2]!.trigger("click");

    await w.find('[aria-label="Move selected right"]').trigger("click");
    expect(w.emitted("update:source")!.at(-1)).toEqual([["Beta"]]);
    expect(w.emitted("update:target")!.at(-1)).toEqual([["Alpha", "Gamma"]]);
  });

  it("transfer with nothing selected is inert (button disabled, no emits)", async () => {
    const w = mountPick();
    const btn = w.find('[aria-label="Move selected right"]');
    expect(btn.attributes("disabled")).toBeDefined();
    await btn.trigger("click");
    expect(w.emitted("update:source")).toBeUndefined();
    expect(w.emitted("update:target")).toBeUndefined();
  });

  it("moves selected target items back to the source", async () => {
    const w = mountPick({ source: [], target: ["Alpha", "Beta"] });
    await targetLis(w)[1]!.trigger("click");
    await w.find('[aria-label="Move selected left"]').trigger("click");
    expect(w.emitted("update:target")!.at(-1)).toEqual([["Alpha"]]);
    expect(w.emitted("update:source")!.at(-1)).toEqual([["Beta"]]);
  });

  it("moves everything on the all-right / all-left controls", async () => {
    const w = mountPick({ target: ["Delta"] });
    await w.find('[aria-label="Move all right"]').trigger("click");
    expect(w.emitted("update:source")!.at(-1)).toEqual([[]]);
    expect(w.emitted("update:target")!.at(-1)).toEqual([["Delta", "Alpha", "Beta", "Gamma"]]);

    const w2 = mountPick({ source: [], target: ["Delta"] });
    await w2.find('[aria-label="Move all left"]').trigger("click");
    expect(w2.emitted("update:target")!.at(-1)).toEqual([[]]);
    expect(w2.emitted("update:source")!.at(-1)).toEqual([["Delta"]]);
  });

  it("empty lists render without items and without crashing", async () => {
    const w = mountPick({ source: [], target: [] });
    expect(sourceLis(w)).toHaveLength(0);
    expect(targetLis(w)).toHaveLength(0);
    await w.find('[aria-label="Move all right"]').trigger("click");
    expect(w.emitted("update:source")!.at(-1)).toEqual([[]]);
  });
});

describe("OrderList — reordering", () => {
  const mountOrder = (props: { modelValue?: unknown[]; selectable?: boolean } = {}) =>
    mount(OrderList, { props: { modelValue: props.modelValue ?? sourceItems, selectable: props.selectable ?? true } });

  it("renders items in order; clicking selects one", async () => {
    const w = mountOrder();
    expect(w.findAll(".order-list__item").map((li) => li.text())).toEqual(["Alpha", "Beta", "Gamma"]);

    await w.findAll(".order-list__item")[1]!.trigger("click");
    expect(w.findAll(".order-list__item")[1]!.classes()).toContain("is-selected");
    expect(w.findAll(".order-list__item")[1]!.attributes("aria-selected")).toBe("true");
  });

  it("move up swaps the selected item with its predecessor and clears selection", async () => {
    const w = mountOrder();
    await w.findAll(".order-list__item")[1]!.trigger("click");
    await w.find('[aria-label="Move up"]').trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([["Beta", "Alpha", "Gamma"]]);
    // selection resets after a move
    expect(w.findAll(".order-list__item.is-selected")).toHaveLength(0);
  });

  it("move down swaps the selected item with its successor", async () => {
    const w = mountOrder();
    await w.findAll(".order-list__item")[1]!.trigger("click");
    await w.find('[aria-label="Move down"]').trigger("click");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([["Alpha", "Gamma", "Beta"]]);
  });

  it("clamps at the ends: first item cannot move up, last cannot move down", async () => {
    const w = mountOrder();
    await w.findAll(".order-list__item")[0]!.trigger("click");
    expect(w.find('[aria-label="Move up"]').attributes("disabled")).toBeDefined();
    await w.find('[aria-label="Move up"]').trigger("click");
    expect(w.emitted("update:modelValue")).toBeUndefined();

    await w.findAll(".order-list__item")[2]!.trigger("click");
    expect(w.find('[aria-label="Move down"]').attributes("disabled")).toBeDefined();
    await w.find('[aria-label="Move down"]').trigger("click");
    expect(w.emitted("update:modelValue")).toBeUndefined();
  });

  it("selectable=false: clicks never select and reorder stays inert", async () => {
    const w = mountOrder({ selectable: false });
    await w.findAll(".order-list__item")[0]!.trigger("click");
    expect(w.findAll(".order-list__item.is-selected")).toHaveLength(0);
    expect(w.find('[aria-label="Move up"]').attributes("disabled")).toBeDefined();
    expect(w.find('[aria-label="Move down"]').attributes("disabled")).toBeDefined();
    await w.find('[aria-label="Move down"]').trigger("click");
    expect(w.emitted("update:modelValue")).toBeUndefined();
  });

  it("an empty list renders no items without crashing", () => {
    const w = mountOrder({ modelValue: [] });
    expect(w.findAll(".order-list__item")).toHaveLength(0);
    expect(w.find('[aria-label="Move up"]').attributes("disabled")).toBeDefined();
    expect(w.find('[aria-label="Move down"]').attributes("disabled")).toBeDefined();
  });
});
