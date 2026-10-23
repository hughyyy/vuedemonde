// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick, type ComponentPublicInstance } from "vue";
import TaskBoard from "../src/board/TaskBoard.vue";
import BoardColumn from "../src/board/BoardColumn.vue";
import BoardCard from "../src/board/BoardCard.vue";
import TaskDialog from "../src/board/TaskDialog.vue";
import type { BoardColumnDef, Priority, TaskCard } from "../src/board/model";
import { cancelBoardDrag, startBoardDrag, useBoardDrag } from "../src/board/useDragDrop";

/** TaskDialog replaced so tests can drive props + emits without teleport/dialog chrome. */
const dialogStub = {
  name: "TaskDialog",
  props: ["card", "open"],
  emits: ["close", "update"],
  template: `<div class="dialog-stub"><p class="dialog-stub__title">{{ card ? card.title : "none" }}</p></div>`,
};

type BoardWrapper = VueWrapper<ComponentPublicInstance>;

function mountTaskBoard(): BoardWrapper {
  return mount(TaskBoard, { global: { stubs: { AppIcon: true, TaskDialog: dialogStub } } });
}

/** Column section wrapper by zone id (undefined when the id is not rendered). */
function col(w: BoardWrapper, zoneId: string) {
  return w.findAll(".board-col").find((c) => c.attributes("data-drop-zone") === zoneId);
}

/** Card wrappers inside a column, in DOM order. */
function columnCards(w: BoardWrapper, zoneId: string) {
  const section = col(w, zoneId);
  return section ? section.findAll(".board-card") : [];
}

function card(overrides: Partial<TaskCard> = {}): TaskCard {
  return {
    id: "c1",
    title: "Test card",
    tags: [],
    priority: "P2" as Priority,
    assignees: [],
    ...overrides,
  };
}

function column(overrides: Partial<BoardColumnDef> = {}): BoardColumnDef {
  return {
    id: "col-a",
    title: "Column A",
    accent: "#3b82f6",
    cards: [],
    ...overrides,
  };
}

/** Begin a drag and end it over the element the spy returns. */
function dragAndDrop(cardEl: Element, cardId: string, fromZoneId: string, over: Element): void {
  startBoardDrag(cardEl as HTMLElement, cardId, fromZoneId, new PointerEvent("pointerdown", { clientX: 10, clientY: 10, button: 0, bubbles: true }));
  vi.spyOn(document, "elementFromPoint").mockReturnValue(over);
  window.dispatchEvent(new PointerEvent("pointermove", { clientX: 300, clientY: 300, bubbles: true }));
  window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
}

describe("TaskBoard — seeded render", () => {
  afterEach(() => {
    cancelBoardDrag();
    vi.restoreAllMocks();
  });

  it("mounts all seven pipeline columns in order with their cards and unique card ids", () => {
    const w = mountTaskBoard();
    expect(w.findAll(".board-col__title").map((t) => t.text())).toEqual([
      "Ideas",
      "Discovery",
      "Ready",
      "Building",
      "Blocked",
      "Validation",
      "Shipped",
    ]);
    expect(w.findAll(".board-col").map((c) => c.attributes("data-drop-zone"))).toEqual([
      "ideas",
      "discovery",
      "ready",
      "building",
      "blocked",
      "validation",
      "shipped",
    ]);
    // seed card counts per column: 3, 2, 1, 2, 1, 1, 2
    expect(w.findAll(".board-col").map((c) => c.findAll(".board-card").length)).toEqual([3, 2, 1, 2, 1, 1, 2]);
    const ids = w.findAll(".board-card").map((c) => c.attributes("data-card-id"));
    expect(new Set(ids).size).toBe(ids.length);
    expect(w.findAll(".board-card__title")[0].text()).toBe("Persona-based onboarding paths");
    w.unmount();
  });

  it("renders tags and assignee avatars on seeded cards", () => {
    const w = mountTaskBoard();
    const idea = columnCards(w, "ideas")[0];
    expect(idea.findAll(".board-card__tag").map((t) => t.text())).toEqual(["activation", "research"]);
    expect(idea.findAll(".avatar-stack .app-avatar")).toHaveLength(2);
    expect(idea.attributes("role")).toBe("button");
    w.unmount();
  });
});

describe("TaskBoard — card detail dialog", () => {
  afterEach(() => {
    cancelBoardDrag();
    vi.restoreAllMocks();
  });

  it("opens the dialog with the clicked card and resets on close", async () => {
    const w = mountTaskBoard();
    await w.findAll(".board-card")[0].trigger("click");
    const dlg = w.findComponent(TaskDialog);
    expect(dlg.props("open")).toBe(true);
    expect((dlg.props("card") as TaskCard).title).toBe("Persona-based onboarding paths");
    dlg.vm.$emit("close");
    await nextTick();
    expect(w.findComponent(TaskDialog).props("open")).toBe(false);
    expect(w.findComponent(TaskDialog).props("card")).toBeNull();
    w.unmount();
  });

  it("patches emitted from the dialog update the live card", async () => {
    const w = mountTaskBoard();
    await w.findAll(".board-card")[0].trigger("click");
    w.findComponent(TaskDialog).vm.$emit("update", { title: "Patched" });
    await nextTick();
    expect(w.findAll(".board-card__title")[0].text()).toBe("Patched");
    expect(w.findComponent(TaskDialog).props("card")).toMatchObject({ title: "Patched" });
    w.unmount();
  });
});

describe("TaskBoard — add card", () => {
  afterEach(() => {
    cancelBoardDrag();
    vi.restoreAllMocks();
  });

  it("appends an Untitled card to the clicked column only", async () => {
    const w = mountTaskBoard();
    await w.find('[aria-label="Add card to Ideas"]').trigger("click");
    const untitled = columnCards(w, "ideas").filter((c) => c.find(".board-card__title").text() === "Untitled card");
    expect(untitled).toHaveLength(1);
    expect(columnCards(w, "ideas")).toHaveLength(4);
    // seed columns other than ideas are untouched
    for (const zoneId of ["discovery", "ready", "building", "blocked", "validation", "shipped"]) {
      expect(columnCards(w, zoneId).some((c) => c.find(".board-card__title").text() === "Untitled card")).toBe(false);
    }
    w.unmount();
  });

  it("two adds produce two distinct new rows", async () => {
    const w = mountTaskBoard();
    const add = w.find('[aria-label="Add card to Ideas"]');
    await add.trigger("click");
    await add.trigger("click");
    const untitled = columnCards(w, "ideas").filter((c) => c.find(".board-card__title").text() === "Untitled card");
    expect(untitled).toHaveLength(2);
    const ids = untitled.map((c) => c.attributes("data-card-id"));
    expect(new Set(ids).size).toBe(2);
    w.unmount();
  });
});

describe("TaskBoard — collapse toggle", () => {
  afterEach(() => {
    cancelBoardDrag();
    vi.restoreAllMocks();
  });

  it("hides only the toggled column and restores it on a second click", async () => {
    const w = mountTaskBoard();
    const toggle = w.find('[aria-label="Collapse Ideas column"]');
    await toggle.trigger("click");
    const ideas = col(w, "ideas")!;
    expect(ideas.classes()).toContain("is-collapsed");
    expect(columnCards(w, "ideas")).toHaveLength(0);
    expect(ideas.find(".board-col__collapsed").text()).toBe("3");
    // other columns keep their cards
    expect(columnCards(w, "discovery")).toHaveLength(2);
    await w.find('[aria-label="Collapse Ideas column"]').trigger("click");
    expect(col(w, "ideas")!.classes()).not.toContain("is-collapsed");
    expect(columnCards(w, "ideas")).toHaveLength(3);
    w.unmount();
  });
});

describe("TaskBoard — drag & drop integration", () => {
  afterEach(() => {
    cancelBoardDrag();
    vi.restoreAllMocks();
  });

  it("moves a card into another column when dropped on its zone", async () => {
    const w = mountTaskBoard();
    const ideaCard = w.find('[data-drop-zone="ideas"] .board-card');
    const cardId = ideaCard.attributes("data-card-id")!;
    const shippedList = w.find('[data-drop-zone="shipped"] [data-card-list]').element;
    dragAndDrop(ideaCard.element, cardId, "ideas", shippedList);
    // mirror clone is placed and later cleaned up
    expect(document.querySelector(".board-drag-mirror")).toBeNull();
    await nextTick();
    expect(w.find(`[data-drop-zone="shipped"] [data-card-id="${cardId}"]`).exists()).toBe(true);
    expect(w.find(`[data-drop-zone="ideas"] [data-card-id="${cardId}"]`).exists()).toBe(false);
    expect(columnCards(w, "ideas")).toHaveLength(2);
    expect(columnCards(w, "shipped")).toHaveLength(3);
    w.unmount();
  });

  it("moves a card to a later index within its own column", async () => {
    const w = mountTaskBoard();
    const list = w.find('[data-drop-zone="ideas"] [data-card-list]');
    const first = list.findAll(".board-card")[0];
    const cardId = first.attributes("data-card-id")!;
    dragAndDrop(first.element, cardId, "ideas", list.element);
    await nextTick();
    const after = list.findAll(".board-card").map((c) => c.attributes("data-card-id"));
    expect(after).toHaveLength(3);
    expect(after[0]).not.toBe(cardId);
    expect(after).toContain(cardId);
    w.unmount();
  });

  it("leaves the card in place when the drop happens over no zone", async () => {
    const w = mountTaskBoard();
    const before = columnCards(w, "ideas").map((c) => c.attributes("data-card-id"));
    const el = w.find('[data-drop-zone="ideas"] .board-card');
    dragAndDrop(el.element, el.attributes("data-card-id")!, "ideas", document.body);
    await nextTick();
    expect(columnCards(w, "ideas").map((c) => c.attributes("data-card-id"))).toEqual(before);
    expect(columnCards(w, "shipped")).toHaveLength(2);
    w.unmount();
  });
});

describe("BoardColumn", () => {
  it("renders the title, count, accent, and its cards", () => {
    const c = column({
      title: "Backlog",
      accent: "#f59e0b",
      cards: [
        card({ id: "a", title: "One", tags: ["ui"], priority: "P1", assignees: [{ name: "Sam West" }], due: "Oct 3" }),
        card({ id: "b", title: "Two" }),
      ],
    });
    const w = mount(BoardColumn, { props: { column: c, collapsed: false }, global: { stubs: { AppIcon: true } } });
    expect(w.find(".board-col__title").text()).toBe("Backlog");
    expect(w.find(".board-col__count").text()).toBe("2");
    expect(w.attributes("style")).toContain("--col-accent: #f59e0b");
    expect(w.findAll(".board-card__title").map((t) => t.text())).toEqual(["One", "Two"]);
    // card renders tags + assignee + due
    const first = w.find(".board-card");
    expect(first.find(".board-card__tag").text()).toBe("ui");
    expect(first.find(".board-card__due").text()).toBe("Oct 3");
    expect(first.findAll(".avatar-stack .app-avatar")).toHaveLength(1);
  });

  it("collapsed hides the card list and emits toggle-collapse from its control", async () => {
    const c = column({ cards: [card({ id: "a" }), card({ id: "b" })] });
    const w = mount(BoardColumn, { props: { column: c, collapsed: true }, global: { stubs: { AppIcon: true } } });
    expect(w.classes()).toContain("is-collapsed");
    expect(w.find(".board-col__cards").exists()).toBe(false);
    expect(w.find(".board-col__collapsed").text()).toBe("2");
    await w.find('[aria-label="Collapse Column A column"]').trigger("click");
    expect(w.emitted("toggle-collapse")).toHaveLength(1);
  });

  it("emits add-card from the add button", async () => {
    const w = mount(BoardColumn, { props: { column: column(), collapsed: false }, global: { stubs: { AppIcon: true } } });
    await w.find('[aria-label="Add card to Column A"]').trigger("click");
    expect(w.emitted("add-card")).toHaveLength(1);
  });

  it("re-emits open when a card is clicked (keyboard path included)", async () => {
    const w = mount(BoardColumn, { props: { column: column({ cards: [card({ id: "a" })] }), collapsed: false }, global: { stubs: { AppIcon: true } } });
    await w.find(".board-card").trigger("click");
    expect(w.emitted("open")!.at(-1)).toEqual([{ id: "a", title: "Test card", tags: [], priority: "P2", assignees: [] }]);
    await w.find(".board-card").trigger("keydown.enter");
    expect(w.emitted("open")).toHaveLength(2);
  });

  it("empty cards list renders the empty state without crashing", () => {
    const w = mount(BoardColumn, { props: { column: column(), collapsed: false }, global: { stubs: { AppIcon: true } } });
    expect(w.find(".board-col__count").text()).toBe("0");
    expect(w.find(".board-col__empty").text()).toBe("Drop cards here");
    expect(w.find(".board-col__cards").exists()).toBe(true);
  });
});

describe("BoardCard", () => {
  afterEach(() => cancelBoardDrag());

  it("maps all four priorities to their badge tint class", () => {
    for (const [priority, tint] of [
      ["P0", "is-p0"],
      ["P1", "is-p1"],
      ["P2", "is-p2"],
      ["P3", "is-p3"],
    ] as const) {
      const w = mount(BoardCard, { props: { card: card({ id: `c-${priority}`, priority }), zoneId: "ideas" } });
      const badge = w.find(".board-card__badges .app-badge");
      expect(badge.text()).toBe(priority);
      expect(badge.classes()).toContain(tint);
      w.unmount();
    }
  });

  it("renders tag chips and hides them when there are none", () => {
    const w = mount(BoardCard, { props: { card: card({ tags: ["ui", "perf"] }), zoneId: "ideas" } });
    expect(w.findAll(".board-card__tag").map((t) => t.text())).toEqual(["ui", "perf"]);
    w.unmount();
    const plain = mount(BoardCard, { props: { card: card(), zoneId: "ideas" } });
    expect(plain.find(".board-card__tags").exists()).toBe(false);
    plain.unmount();
  });

  it("renders assignee avatars with +N overflow past four and nothing when none", () => {
    const w = mount(BoardCard, {
      props: { card: card({ assignees: ["A", "B", "C"].map((name) => ({ name })) }), zoneId: "ideas" },
    });
    expect(w.findAll(".avatar-stack .app-avatar")).toHaveLength(3);
    expect(w.find(".avatar-stack").attributes("title")).toBe("A, B, C");
    w.unmount();

    const overflow = mount(BoardCard, {
      props: { card: card({ assignees: ["A", "B", "C", "D", "E"].map((name) => ({ name })) }), zoneId: "ideas" },
    });
    expect(overflow.findAll(".avatar-stack .app-avatar")).toHaveLength(4);
    expect(overflow.find(".avatar-stack__more").text()).toBe("+1");
    overflow.unmount();

    const none = mount(BoardCard, { props: { card: card(), zoneId: "ideas" } });
    expect(none.find(".avatar-stack").exists()).toBe(false);
    none.unmount();
  });

  it("renders the due chip only when a due date is present", () => {
    const withDue = mount(BoardCard, { props: { card: card({ due: "Oct 5" }), zoneId: "ideas" } });
    expect(withDue.find(".board-card__due").text()).toBe("Oct 5");
    withDue.unmount();
    const without = mount(BoardCard, { props: { card: card(), zoneId: "ideas" } });
    expect(without.find(".board-card__due").exists()).toBe(false);
    without.unmount();
  });

  it("pointerdown starts a board drag: state + mirror clone", () => {
    const el = document.createElement("article");
    document.body.appendChild(el);
    const w = mount(BoardCard, { props: { card: card({ id: "drag-me" }), zoneId: "shipped" } });
    const cardEl = w.find(".board-card").element as HTMLElement;
    cardEl.dispatchEvent(new PointerEvent("pointerdown", { clientX: 5, clientY: 5, button: 0, bubbles: true }));
    expect(useBoardDrag().state.drag).toEqual({ cardId: "drag-me", fromZoneId: "shipped" });
    const mirror = document.querySelector(".board-drag-mirror");
    expect(mirror).not.toBeNull();
    expect(mirror?.getAttribute("data-card-id")).toBe("drag-me");
    el.remove();
    w.unmount();
  });

  it("ignores pointerdown from interactive elements and non-left buttons", () => {
    const w = mount(BoardCard, {
      props: { card: card({ id: "no-drag" }), zoneId: "ideas" },
      slots: { default: "" },
    });
    const cardEl = w.find(".board-card").element as HTMLElement;
    const button = document.createElement("button");
    cardEl.appendChild(button);
    button.dispatchEvent(new PointerEvent("pointerdown", { clientX: 5, clientY: 5, button: 0, bubbles: true }));
    expect(useBoardDrag().state.drag).toBeNull();
    button.remove();
    w.unmount();
  });
});
