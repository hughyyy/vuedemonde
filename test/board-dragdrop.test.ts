// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { cancelBoardDrag, setBoardDropHandler, startBoardDrag, useBoardDrag, type DropTarget } from "../src/board/useDragDrop";

/** Build a drop zone with a vertical card list. */
function zone(zoneId: string, cardIds: string[], orientation: "vertical" | "horizontal" = "vertical"): HTMLElement {
  const root = document.createElement("div");
  root.setAttribute("data-drop-zone", zoneId);
  const list = document.createElement("div");
  list.setAttribute("data-card-list", "");
  list.dataset["orientation"] = orientation;
  for (const id of cardIds) {
    const card = document.createElement("div");
    card.dataset["cardId"] = id;
    list.append(card);
  }
  root.append(list);
  return root;
}

/** Give children deterministic rects: child i spans [i*50, i*50+40]. */
function stubRects(list: HTMLElement): void {
  Array.from(list.children).forEach((child, i) => {
    vi.spyOn(child as HTMLElement, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: i * 50,
      top: i * 50,
      left: 0,
      right: 40,
      bottom: i * 50 + 40,
      width: 40,
      height: 40,
      toJSON: () => ({}),
    } as DOMRect);
  });
}

describe("useBoardDrag — module singleton drag state", () => {
  let el: HTMLElement;
  let pointAt: MockInstance;

  beforeEach(() => {
    cancelBoardDrag(); // reset module state (mirror, listeners)
    setBoardDropHandler(null);
    el = document.createElement("div");
    document.body.append(el);
  });

  afterEach(() => {
    cancelBoardDrag();
    pointAt?.mockRestore();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  function start(): void {
    const event = new PointerEvent("pointerdown", { bubbles: true, clientX: 100, clientY: 200 });
    startBoardDrag(el, "card-1", "col-1", event);
  }

  it("mirror-clones the card onto the body, offset by 8px, and records drag state", () => {
    start();
    const { state } = useBoardDrag();
    expect(state.drag).toEqual({ cardId: "card-1", fromZoneId: "col-1" });
    const mirror = document.body.querySelector<HTMLElement>(".board-drag-mirror");
    expect(mirror).not.toBeNull();
    expect(mirror!.style.left).toBe("108px");
    expect(mirror!.style.top).toBe("208px");
  });

  it("computes a drop index from card midpoints on pointermove (vertical)", () => {
    const z = zone("col-b", ["card-x", "card-y", "card-z"]);
    stubRects(z.querySelector<HTMLElement>("[data-card-list]")!);
    document.body.append(z);
    pointAt = vi.spyOn(document, "elementFromPoint").mockReturnValue(z);

    start();
    // y=110 sits between the second and third midpoints (70 and 120) → index 2
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 5, clientY: 110 }));
    const { state } = useBoardDrag();
    expect(state.indicator).toEqual({ zoneId: "col-b", index: 2 });
  });

  it("skips the dragged card itself while counting the insertion index", () => {
    const z = zone("col-b", ["card-1", "card-y"]); // card-1 is the one being dragged
    stubRects(z.querySelector<HTMLElement>("[data-card-list]")!);
    document.body.append(z);
    pointAt = vi.spyOn(document, "elementFromPoint").mockReturnValue(z);

    start();
    // over the second visible child → index 1 (dragged card not counted twice)
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 5, clientY: 120 }));
    const { state } = useBoardDrag();
    expect(state.indicator).toEqual({ zoneId: "col-b", index: 1 });
  });

  it("computes indices by width midpoint for horizontal lanes", () => {
    let z = zone("lane-1", ["a", "b", "c"], "horizontal");
    let list = z.querySelector<HTMLElement>("[data-card-list]")!;
    Array.from(list.children).forEach((child, i) => {
      vi.spyOn(child as HTMLElement, "getBoundingClientRect").mockReturnValue({
        x: i * 50,
        y: 0,
        top: 0,
        left: i * 50,
        right: i * 50 + 40,
        bottom: 40,
        width: 40,
        height: 40,
        toJSON: () => ({}),
      } as DOMRect);
    });
    document.body.append(z);
    pointAt = vi.spyOn(document, "elementFromPoint").mockReturnValue(z);

    start();
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 130, clientY: 20 }));
    const { state } = useBoardDrag();
    expect(state.indicator).toEqual({ zoneId: "lane-1", index: 3 }); // past the end
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 10, clientY: 20 }));
    expect(state.indicator).toEqual({ zoneId: "lane-1", index: 0 });
  });

  it("drops onto a zone with no card list at index 0", () => {
    const bare = document.createElement("div");
    bare.setAttribute("data-drop-zone", "empty-col");
    document.body.append(bare);
    pointAt = vi.spyOn(document, "elementFromPoint").mockReturnValue(bare);

    start();
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 5, clientY: 5 }));
    const { state } = useBoardDrag();
    expect(state.indicator).toEqual({ zoneId: "empty-col", index: 0 });
  });

  it("reports null when the pointer is over no drop zone", () => {
    pointAt = vi.spyOn(document, "elementFromPoint").mockReturnValue(document.body);
    start();
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 5, clientY: 5 }));
    const { state } = useBoardDrag();
    expect(state.indicator).toBeNull();
  });

  it("reports null when elementFromPoint finds nothing", () => {
    pointAt = vi.spyOn(document, "elementFromPoint").mockReturnValue(null);
    start();
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 5, clientY: 5 }));
    const { state } = useBoardDrag();
    expect(state.indicator).toBeNull();
  });

  it("pointerup delivers the drop target to the registered handler and resets state", () => {
    const z = zone("col-b", []);
    document.body.append(z);
    pointAt = vi.spyOn(document, "elementFromPoint").mockReturnValue(z);
    const handler = vi.fn<(t: DropTarget) => void>();
    setBoardDropHandler(handler);

    start();
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 5, clientY: 5 }));
    window.dispatchEvent(new PointerEvent("pointerup"));

    expect(handler).toHaveBeenCalledWith({ toZoneId: "col-b", index: 0 });
    const { state } = useBoardDrag();
    expect(state.drag).toBeNull();
    expect(state.indicator).toBeNull();
    expect(document.querySelector(".board-drag-mirror")).toBeNull();
    // drag listeners are gone: another move must not mutate anything
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 5, clientY: 9 }));
    expect(state.indicator).toBeNull();
  });

  it("pointerup without an indicator never calls the handler", () => {
    pointAt = vi.spyOn(document, "elementFromPoint").mockReturnValue(document.body);
    const handler = vi.fn<(t: DropTarget) => void>();
    setBoardDropHandler(handler);

    start();
    window.dispatchEvent(new PointerEvent("pointerup"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("cancelBoardDrag aborts without delivering a drop", () => {
    const z = zone("col-b", []);
    document.body.append(z);
    pointAt = vi.spyOn(document, "elementFromPoint").mockReturnValue(z);
    const handler = vi.fn<(t: DropTarget) => void>();
    setBoardDropHandler(handler);

    start();
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 5, clientY: 5 }));
    cancelBoardDrag();

    expect(handler).not.toHaveBeenCalled();
    const { state } = useBoardDrag();
    expect(state.drag).toBeNull();
    expect(state.indicator).toBeNull();
    expect(document.querySelector(".board-drag-mirror")).toBeNull();
    window.dispatchEvent(new PointerEvent("pointerup"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("a second start cleans up the first drag's mirror before mirroring anew", () => {
    start();
    expect(document.querySelectorAll(".board-drag-mirror")).toHaveLength(1);
    start();
    expect(document.querySelectorAll(".board-drag-mirror")).toHaveLength(1);
    const { state } = useBoardDrag();
    expect(state.drag).toEqual({ cardId: "card-1", fromZoneId: "col-1" });
  });
});
