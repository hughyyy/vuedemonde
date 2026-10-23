// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick, type ComponentPublicInstance } from "vue";
import LaneBoard from "../src/board/LaneBoard.vue";
import BoardToolbar from "../src/board/BoardToolbar.vue";
import TaskDialog from "../src/board/TaskDialog.vue";
import type * as BoardModel from "../src/board/model";
import type { BoardStat, LaneDef, TaskCard } from "../src/board/model";
import { cancelBoardDrag } from "../src/board/useDragDrop";

// LaneBoard seeds internally; the mock lets tests feed it arbitrary lane data
// (including an empty board — unreachable through the component's API).
const { mockSeedLanes } = vi.hoisted(() => ({ mockSeedLanes: vi.fn() }));
vi.mock("../src/board/model", async (importOriginal) => {
  const mod = (await importOriginal()) as typeof BoardModel;
  return { ...mod, seedLanes: mockSeedLanes };
});

const dialogStub = {
  name: "TaskDialog",
  props: ["card", "open"],
  emits: ["close", "update"],
  template: `<div class="dialog-stub"><p class="dialog-stub__title">{{ card ? card.title : "none" }}</p></div>`,
};

function lane(overrides: Partial<LaneDef> = {}): LaneDef {
  return {
    id: "lane-a",
    title: "Alpha lane",
    accent: "#0ea5e9",
    cards: [],
    ...overrides,
  };
}

function stat(label: string, value: number, tint?: BoardStat["tint"]): BoardStat {
  return tint === undefined ? { label, value } : { label, value, tint };
}

function mountLaneBoard(): VueWrapper<ComponentPublicInstance> {
  return mount(LaneBoard, { global: { stubs: { AppIcon: true, TaskDialog: dialogStub } } });
}

describe("LaneBoard", () => {
  beforeEach(() => mockSeedLanes.mockReset());
  afterEach(() => {
    cancelBoardDrag();
    vi.restoreAllMocks();
  });

  it("renders each lane: title, subtitle, accent, summary stats, and cards", () => {
    mockSeedLanes.mockReturnValue([
      lane({
        id: "alpha",
        title: "Alpha",
        subtitle: "Q3 planning",
        accent: "#6366f1",
        summary: [
          stat("initiatives", 12, "info"),
          stat("blocked", 1, "err"),
        ],
        cards: [
          { id: "a1", title: "Launch checklist", tags: ["launch"], priority: "P0", due: "Oct 1", assignees: [{ name: "M. Lee" }] },
          { id: "a2", title: "Migration", tags: [], priority: "P1", assignees: [] },
        ],
      }),
    ]);
    const w = mountLaneBoard();
    const lanes = w.findAll(".lane");
    expect(lanes).toHaveLength(1);
    const section = w.find('[data-drop-zone="alpha"]');
    expect(section.find(".lane__title").text()).toBe("Alpha");
    expect(section.find(".lane__subtitle").text()).toBe("Q3 planning");
    expect(section.attributes("style")).toContain("--lane-accent: #6366f1");
    const stats = section.findAll(".lane__stat");
    expect(stats.map((s) => s.find(".lane__stat-label").text())).toEqual(["initiatives", "blocked"]);
    expect(stats.map((s) => s.find(".app-badge").text())).toEqual(["12", "1"]);
    expect(stats[0].find(".app-badge").classes()).toContain("is-info");
    expect(stats[1].find(".app-badge").classes()).toContain("is-err");
    expect(section.findAll(".board-card__title").map((t) => t.text())).toEqual(["Launch checklist", "Migration"]);
    expect(section.find('[aria-label="Add card to Alpha"]').exists()).toBe(true);
    w.unmount();
  });

  it("renders multiple lanes in order", () => {
    mockSeedLanes.mockReturnValue([
      lane({ id: "first", title: "First lane" }),
      lane({ id: "second", title: "Second lane" }),
    ]);
    const w = mountLaneBoard();
    expect(w.findAll(".lane__title").map((t) => t.text())).toEqual(["First lane", "Second lane"]);
    w.unmount();
  });

  it("omits subtitle and summary when not provided", () => {
    mockSeedLanes.mockReturnValue([lane({ id: "bare", title: "Bare lane", cards: [] })]);
    const w = mountLaneBoard();
    const section = w.find('[data-drop-zone="bare"]');
    expect(section.find(".lane__subtitle").exists()).toBe(false);
    expect(section.find(".lane__summary").exists()).toBe(false);
    w.unmount();
  });

  it("a lane with no cards renders its header and an empty hint", () => {
    mockSeedLanes.mockReturnValue([lane({ id: "empty-lane", title: "Empty lane" })]);
    const w = mountLaneBoard();
    const section = w.find('[data-drop-zone="empty-lane"]');
    expect(section.find(".lane__title").text()).toBe("Empty lane");
    expect(section.findAll(".board-card")).toHaveLength(0);
    expect(section.find(".lane__empty").text()).toBe("Drop cards here");
    w.unmount();
  });

  it("an empty lanes array renders without crashing", () => {
    mockSeedLanes.mockReturnValue([]);
    const w = mountLaneBoard();
    expect(w.find(".lane-board").exists()).toBe(true);
    expect(w.findAll(".lane")).toHaveLength(0);
    w.unmount();
  });

  it("adds an Untitled card to the lane's add button", async () => {
    mockSeedLanes.mockReturnValue([lane({ id: "alpha", title: "Alpha", cards: [{ id: "a1", title: "Existing", tags: [], priority: "P2", assignees: [] }] })]);
    const w = mountLaneBoard();
    await w.find('[aria-label="Add card to Alpha"]').trigger("click");
    const titles = w.findAll(".board-card__title").map((t) => t.text());
    expect(titles).toEqual(["Existing", "Untitled card"]);
    w.unmount();
  });

  it("opens the detail dialog on a card click and closes it", async () => {
    mockSeedLanes.mockReturnValue([lane({ id: "alpha", title: "Alpha", cards: [{ id: "a1", title: "Existing", tags: [], priority: "P2", assignees: [] }] })]);
    const w = mountLaneBoard();
    await w.find(".board-card").trigger("click");
    const dlg = w.findComponent(TaskDialog);
    expect(dlg.props("open")).toBe(true);
    expect((dlg.props("card") as TaskCard).title).toBe("Existing");
    dlg.vm.$emit("close");
    await nextTick();
    expect(w.findComponent(TaskDialog).props("open")).toBe(false);
    w.unmount();
  });
});

describe("BoardToolbar", () => {
  it("renders the title and stats in order with tint classes", () => {
    const stats: BoardStat[] = [
      stat("total", 42, "info"),
      stat("blocked", 3, "err"),
      stat("plain", 7),
    ];
    const w = mount(BoardToolbar, { props: { title: "Pipeline", stats } });
    expect(w.find(".board-toolbar__title").text()).toBe("Pipeline");
    const rendered = w.findAll(".board-toolbar__stat");
    expect(rendered.map((s) => s.find(".board-toolbar__stat-label").text())).toEqual(["total", "blocked", "plain"]);
    expect(rendered.map((s) => s.find(".app-badge").text())).toEqual(["42", "3", "7"]);
    expect(rendered[0].find(".app-badge").classes()).toContain("is-info");
    expect(rendered[1].find(".app-badge").classes()).toContain("is-err");
  });

  it("missing tint falls back to the neutral badge class", () => {
    const w = mount(BoardToolbar, { props: { stats: [stat("plain", 7)] } });
    expect(w.find(".app-badge").classes()).toContain("is-neutral");
  });

  it("empty stats render without crash and omit the title when absent", () => {
    const w = mount(BoardToolbar, { props: {} });
    expect(w.find(".board-toolbar").exists()).toBe(true);
    expect(w.find(".board-toolbar__title").exists()).toBe(false);
    expect(w.findAll(".board-toolbar__stat")).toHaveLength(0);
  });

  it("renders slot content on the right", () => {
    const w = mount(BoardToolbar, { props: { title: "T", stats: [stat("a", 1)] }, slots: { default: "<button class='x'>Go</button>" } });
    expect(w.find(".board-toolbar__right .x").text()).toBe("Go");
  });
});
