import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATALOGUE_GROUPS, COMPONENT_DEMOS, SHOT_WIDTH } from "../playground/src/catalogue";

/**
 * Catalogue registry parity.
 *
 * The per-component catalogue renders ONE image per exported component
 * (docs/per-component-rendering.md). These assertions are what stop it rotting:
 * a new export without a demo fails, and a registry entry for a component that
 * no longer exists fails too.
 */

/** Every `export { default as X } from "./X.vue"` in the four public barrels. */
function barrelExports(): string[] {
  const barrels = ["src/kit/index.ts", "src/charts/index.ts", "src/calendar/index.ts", "src/board/index.ts"];
  return barrels.flatMap((file) =>
    [...readFileSync(file, "utf8").matchAll(/export \{ default as (\w+) \} from "\.\/[\w]+\.vue"/g)].map(
      (m) => m[1]!,
    ),
  );
}

describe("catalogue registry", () => {
  const exports = barrelExports();
  const ids = Object.keys(COMPONENT_DEMOS);

  it("has an entry for every exported component", () => {
    const missing = exports.filter((name) => !(name in COMPONENT_DEMOS));
    expect(missing, `components exported but missing a catalogue demo: ${missing.join(", ")}`).toEqual([]);
  });

  it("has no entry for a component that is not exported", () => {
    const extra = ids.filter((id) => !exports.includes(id));
    expect(extra, `registry entries with no matching export: ${extra.join(", ")}`).toEqual([]);
  });

  it("registers each component exactly once", () => {
    expect(ids.length).toBe(new Set(ids).size);
    expect(ids.length).toBe(exports.length);
  });

  it("labels every entry with its own id and a known group", () => {
    for (const [id, entry] of Object.entries(COMPONENT_DEMOS)) {
      expect(entry.label, `${id} label`).toBe(id);
      expect(CATALOGUE_GROUPS, `${id} group`).toContain(entry.group);
      expect(entry.demo, `${id} demo component`).toBeTruthy();
      if (entry.shot !== undefined) expect(entry.shot).toBeGreaterThan(0);
    }
  });

  it("ships a demo SFC for every entry", () => {
    const files = new Set(readdirSync("playground/src/catalogue").filter((f) => f.endsWith(".demo.vue")));
    const missing = ids.filter((id) => !files.has(`${id}.demo.vue`));
    expect(missing, `registry entries with no demo SFC: ${missing.join(", ")}`).toEqual([]);
  });

  it("keeps the default capture width sane", () => {
    // The composite is 3 columns wide; a cell must stay readable but the stitched
    // image must not explode past a couple of thousand device px per row.
    expect(SHOT_WIDTH).toBeGreaterThanOrEqual(320);
    expect(SHOT_WIDTH).toBeLessThanOrEqual(900);
  });
});
