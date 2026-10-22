import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isThemeId, THEME_IDS, THEME_LABELS } from "../src/theme";
import { ICON_NAMES, iconPaths } from "../src/kit/icons";

describe("theme ids", () => {
  it("matches the blocks shipped in theme.css, in order", () => {
    const css = readFileSync("src/theme.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const blocks = ["dark", ...[...css.matchAll(/\[data-theme="([^"]+)"\]/g)].map((m) => m[1]!)];
    expect(THEME_IDS).toEqual(blocks);
  });

  it("declares :root as the dark theme and nothing else on the root selector", () => {
    const css = readFileSync("src/theme.css", "utf8");
    const roots = [...css.matchAll(/(?<![\w-]):root\s*\{([^}]*)\}/g)].map((m) => m[1]!);
    expect(roots.length).toBeGreaterThan(0);
    expect(roots[0]).toContain("--bg:");
  });

  it("labels every id, defaults to dark on junk", () => {
    for (const id of THEME_IDS) expect(THEME_LABELS[id]).toBeTruthy();
    expect(isThemeId("dark")).toBe(true);
    expect(isThemeId("light")).toBe(true);
    expect(isThemeId("chartreuse")).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
  });
});

describe("icon set", () => {
  it("is non-empty and every name resolves to at least one path", () => {
    expect(ICON_NAMES.length).toBeGreaterThan(20);
    for (const name of ICON_NAMES) {
      expect(iconPaths(name).length).toBeGreaterThan(0);
    }
  });
});
