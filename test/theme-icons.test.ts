import { describe, expect, it } from "vitest";
import { isThemeId, THEME_IDS, THEME_LABELS } from "../src/theme";
import { ICON_NAMES, iconPaths } from "../src/kit/icons";

describe("theme ids", () => {
  it("covers every theme block shipped in theme.css", () => {
    const blocks = [
      "dark",
      "light",
      "late-night",
      "thermal",
      "neon-cyberpunk",
      "grunge",
      "granite",
      "classic",
      "high-contrast",
      "bubblegum",
      "matrix",
      "shining-gold",
      "pure-platinum",
      "mint",
      "sunshine",
      "monotone",
    ];
    expect(THEME_IDS).toEqual(blocks);
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
