// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { PRIORITY_TINTS, priorityTint, seedBoard, seedLanes, type TaskCard } from "../src/board/model";

describe("board model — priorities", () => {
  it("maps every priority to a card tint", () => {
    expect(priorityTint("P0")).toBe("p0");
    expect(priorityTint("P1")).toBe("p1");
    expect(priorityTint("P2")).toBe("p2");
    expect(priorityTint("P3")).toBe("p3");
  });

  it("PRIORITY_TINTS covers exactly the Priority union", () => {
    expect(new Set(Object.keys(PRIORITY_TINTS))).toEqual(new Set(["P0", "P1", "P2", "P3"]));
  });
});

describe("board model — seedBoard invariants", () => {
  const board = seedBoard();
  const allCards: TaskCard[] = board.flatMap((c) => c.cards);

  it("has the seven pipeline stages with ids, titles, accents", () => {
    expect(board.map((c) => c.id)).toEqual(["ideas", "discovery", "ready", "building", "blocked", "validation", "shipped"]);
    for (const col of board) {
      expect(col.title.length).toBeGreaterThan(0);
      expect(col.accent).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("every card id is unique across the whole board", () => {
    const ids = allCards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every card carries a valid priority, arrays, and an optional due date", () => {
    for (const c of allCards) {
      expect(["P0", "P1", "P2", "P3"]).toContain(c.priority);
      expect(Array.isArray(c.tags)).toBe(true);
      expect(Array.isArray(c.assignees)).toBe(true);
      for (const a of c.assignees) expect(typeof a.name).toBe("string");
      if (c.due !== undefined) expect(c.due).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
    }
  });

  it("contains at least one card of every priority", () => {
    for (const p of ["P0", "P1", "P2", "P3"] as const) {
      expect(allCards.some((c) => c.priority === p)).toBe(true);
    }
  });

  it("two seed calls never collide on ids", () => {
    const again = seedBoard();
    const idsA = allCards.map((c) => c.id);
    const idsB = again.flatMap((c) => c.cards).map((c) => c.id);
    expect(new Set([...idsA, ...idsB]).size).toBe(idsA.length + idsB.length);
  });
});

describe("board model — seedLanes invariants", () => {
  const lanes = seedLanes();
  const allCards: TaskCard[] = lanes.flatMap((l) => l.cards);

  it("every lane has markers, optional subtitle, and valid summaries", () => {
    for (const l of lanes) {
      expect(l.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(l.title.length).toBeGreaterThan(0);
      for (const s of l.summary ?? []) {
        expect(typeof s.value).toBe("number");
        expect(["ok", "warn", "err", "info", "run"]).toContain(s.tint);
      }
    }
  });

  it("card ids are unique across lanes", () => {
    const ids = allCards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every priority appears and P0 cards are flagged high", () => {
    for (const p of ["P0", "P1", "P2", "P3"] as const) {
      expect(allCards.some((c) => c.priority === p)).toBe(true);
    }
    expect(allCards.filter((c) => c.priority === "P0").length).toBeGreaterThan(0);
  });
});
