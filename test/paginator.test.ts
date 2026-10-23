// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Paginator from "../src/kit/Paginator.vue";
import AppIcon from "../src/kit/AppIcon.vue";

function mountPaginator(props: Record<string, unknown> = {}) {
  return mount(Paginator, {
    props: { page: 0, pageCount: 1, ...props },
    global: { stubs: { AppIcon: true } },
  });
}

const n = (w: ReturnType<typeof mountPaginator>) => w.findAll(".paginator__num").map((b) => Number(b.text()));

describe("Paginator — page window", () => {
  it("renders every page when count is small (no ellipsis)", () => {
    const w = mountPaginator({ page: 1, pageCount: 5 });
    expect(n(w)).toEqual([1, 2, 3, 4, 5]);
    expect(w.find(".paginator__ellipsis").exists()).toBe(false);
  });

  it("compresses large counts to ends + neighbours with ellipses", () => {
    const w = mountPaginator({ page: 5, pageCount: 20 });
    expect(n(w)).toEqual([1, 5, 6, 7, 20]);
    expect(w.findAll(".paginator__ellipsis")).toHaveLength(2);
  });

  it("at the first page only the right ellipse is shown", () => {
    const w = mountPaginator({ page: 0, pageCount: 20 });
    expect(n(w)).toEqual([1, 2, 20]);
    expect(w.findAll(".paginator__ellipsis")).toHaveLength(1);
  });

  it("at the last page only the left ellipse is shown", () => {
    const w = mountPaginator({ page: 19, pageCount: 20 });
    expect(n(w)).toEqual([1, 19, 20]);
  });

  it("a single page renders just page 1 with both arrows disabled", () => {
    const w = mountPaginator({ page: 0, pageCount: 1 });
    expect(n(w)).toEqual([1]);
    const btns = w.findAll(".paginator__btn");
    expect(btns[0].attributes("disabled")).toBeDefined();
    expect(btns[1].attributes("disabled")).toBeDefined();
  });

  it("marks the current page with aria-current and the active class", () => {
    const w = mountPaginator({ page: 2, pageCount: 5 });
    expect(w.findAll(".paginator__num")[2].attributes("aria-current")).toBe("page");
    expect(w.findAll(".paginator__num")[2].classes()).toContain("is-active");
    expect(w.findAll(".paginator__num")[0].attributes("aria-current")).toBeUndefined();
  });

  it("emits update:page on number, prev and next clicks, clamped by disabled", async () => {
    const w = mountPaginator({ page: 3, pageCount: 10 });
    await w.findAll(".paginator__num")[1].trigger("click");
    expect(w.emitted("update:page")!.at(-1)).toEqual([2]);
    await w.find('[aria-label="Next page"]').trigger("click");
    expect(w.emitted("update:page")!.at(-1)).toEqual([4]);
    await w.find('[aria-label="Previous page"]').trigger("click");
    expect(w.emitted("update:page")!.at(-1)).toEqual([2]);
  });

  it("prev/next cannot leave the range at either end", async () => {
    const w = mountPaginator({ page: 0, pageCount: 3 });
    await w.find('[aria-label="Previous page"]').trigger("click");
    expect(w.emitted("update:page")).toBeUndefined();
    const w2 = mountPaginator({ page: 2, pageCount: 3 });
    await w2.find('[aria-label="Next page"]').trigger("click");
    expect(w2.emitted("update:page")).toBeUndefined();
  });
});

describe("Paginator — range info", () => {
  it("shows the a–b of N window for the current page and size", () => {
    const w = mountPaginator({ page: 1, pageCount: 10, total: 95, pageSize: 10 });
    expect(w.find(".paginator__info").text()).toBe("11–20 of 95");
  });

  it("clamps the ending bound to the total", () => {
    const w = mountPaginator({ page: 9, pageCount: 10, total: 95, pageSize: 10 });
    expect(w.find(".paginator__info").text()).toBe("91–95 of 95");
  });

  it("is omitted when total or pageSize is missing", () => {
    const w = mountPaginator({ page: 0, pageCount: 3, total: 30 });
    expect(w.find(".paginator__info").exists()).toBe(false);
  });
});

// keep the icon import for direct (un-stubbed) usage documented
void AppIcon;
