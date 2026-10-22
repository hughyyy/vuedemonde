// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_IDS, THEME_LABELS } from "../src/theme";
import {
  ANCHORS,
  ANCHOR_GROUPS,
  DERIVED_GROUPS,
  THEME_TOKEN_ORDER,
  defaultSpec,
  deriveTheme,
  emitRegistration,
  emitThemeBlock,
  emitUsage,
  encodeSpec,
  decodeSpec,
  modeFor,
  parseThemeCss,
  resolveTheme,
  specFromTokens,
  themeSelector,
  validateTheme,
  type ThemeSpec,
} from "../playground/src/builder/theme-spec";

// Vitest runs with the project root as cwd; `?raw` imports are not usable here
// because the test env rewrites them to an empty string.
const themeCss = readFileSync("src/theme.css", "utf8");
const parsed = parseThemeCss(themeCss);
const byId = Object.fromEntries(parsed.map((p) => [p.id, p.tokens]));

describe("parseThemeCss", () => {
  it("finds every shipped theme block, :root included", () => {
    const ids = parsed.map((p) => p.id);
    expect(ids).toContain("dark");
    for (const id of THEME_IDS) expect(ids).toContain(id);
  });

  it("reads all 34 theme tokens and ignores the structural ones", () => {
    const dark = byId["dark"]!;
    expect(Object.keys(dark).sort()).toEqual([...THEME_TOKEN_ORDER].sort());
    expect(dark).not.toHaveProperty("font-body");
    expect(dark).not.toHaveProperty("radius-md");
  });
});

describe("round-trip: every shipped theme survives parse → derive → emit", () => {
  for (const id of THEME_IDS) {
    it(id, () => {
      const tokens = byId[id];
      expect(tokens, `${id} block missing from theme.css`).toBeDefined();
      const spec = specFromTokens(id, THEME_LABELS[id], tokens!);

      // 1. parsing the emitted block returns the same values, token for token
      const emitted = emitThemeBlock(spec, "selectable");
      const reparsed = parseThemeCss(emitted)[0]!;
      expect(reparsed.id).toBe(id);
      expect(reparsed.tokens).toEqual(tokens);

      // 2. the derivation alone already reproduces every non-overridden token
      const derived = deriveTheme(spec);
      for (const token of THEME_TOKEN_ORDER) {
        if (spec.overrides[token] === undefined) expect(derived[token]).toBe(tokens![token]);
      }
    });
  }

  it("records hand-tuned departures from the derivation as overrides", () => {
    const light = specFromTokens("light", "Light", byId["light"]!);
    // The shipped light accent-strong is darker than the generic derivation.
    expect(light.overrides["accent-strong"]).toBe("#2457b0");
    expect(deriveTheme(light)["accent-strong"]).not.toBe("#2457b0");
    expect(Object.keys(light.overrides).length).toBeGreaterThan(10);
  });
});

describe("derivation", () => {
  it("keeps the invariants the stylesheet relies on", () => {
    const spec = defaultSpec();
    const v = resolveTheme(spec);
    expect(v["accent-gradient"]).toBe("linear-gradient(var(--accent), var(--accent-2))");
    for (const token of ["accent", "ok", "warn", "err", "run", "info"] as const) {
      const soft = v[`${token}-soft` as keyof typeof v];
      const alpha = /rgba\([^)]*,\s*([\d.]+)\s*\)/.exec(soft)?.[1];
      expect(Number(alpha)).toBe(spec.softAlpha);
      expect(soft.startsWith("rgba(")).toBe(true);
    }
    for (const token of ["shadow-raised", "shadow-overlay", "shadow-modal"] as const) {
      expect(v[token]).toMatch(/^0 \d+px \d+px rgba\(/);
    }
  });

  it("moves surfaces away from the background in both modes", () => {
    const dark = resolveTheme({ ...defaultSpec(), mode: "dark" });
    expect(dark["surface-1"]).not.toBe(dark.bg);
    expect(dark["surface-2"]).not.toBe(dark["surface-1"]);

    const lightSpec: ThemeSpec = {
      ...defaultSpec(),
      mode: "light",
      anchors: {
        ...defaultSpec().anchors,
        bg: "#f4f6f8",
        text: "#1b2330",
        "surface-1": "#ffffff",
        "canvas-bg": "#eef1f4",
      },
    };
    const light = resolveTheme(lightSpec);
    expect(light["surface-2"]).not.toBe(light["surface-1"]);
    expect(light["surface-3"]).not.toBe(light["surface-2"]);
    expect(validateTheme(lightSpec).filter((f) => f.token === "ladder")).toHaveLength(0);
  });


  it("detects the mode from the background luminance", () => {
    expect(modeFor("#101418")).toBe("dark");
    expect(modeFor("#f4f6f8")).toBe("light");
  });

  it("an override wins over the derivation", () => {
    const spec: ThemeSpec = { ...defaultSpec(), overrides: { "text-3": "#ff0000" } };
    expect(resolveTheme(spec)["text-3"]).toBe("#ff0000");
    expect(deriveTheme(spec)["text-3"]).not.toBe("#ff0000");
  });
});

describe("emission", () => {
  const spec = { ...defaultSpec(), id: "ocean", label: "Ocean" };

  it("uses a selector per export mode", () => {
    expect(themeSelector(spec, "selectable")).toBe('[data-theme="ocean"]');
    expect(themeSelector(spec, "fixed")).toBe(":root");
    expect(themeSelector(spec, "default")).toBe(":root:not([data-theme])");
  });

  it("declares color-scheme and every token once, in shipped order", () => {
    const css = emitThemeBlock(spec, "selectable");
    expect(css).toContain("color-scheme: dark;");
    const names = [...css.matchAll(/--([a-z0-9-]+):/g)].map((m) => m[1]);
    expect(names).toEqual([...THEME_TOKEN_ORDER]);
  });

  it("registers the id and label without requiring a hand-edited banner or test list", () => {
    const reg = emitRegistration(spec);
    expect(reg).toContain('"ocean"');
    expect(reg).toContain('"ocean": "Ocean"');
    expect(reg).toContain("THEME_IDS");
    expect(reg).toContain("THEME_LABELS");
    expect(reg).not.toContain("test/theme-icons.test.ts");
  });

  it("warns that fixed/default blocks live outside theme.css", () => {
    expect(emitUsage("fixed")).toContain("Do not paste it into theme.css");
    expect(emitUsage("default")).toContain("Leave <html> without data-theme");
    expect(emitUsage("selectable")).toContain("src/theme.css");
  });
});

describe("validation", () => {
  it("is clean for a derived theme from the shipped palette", () => {
    expect(validateTheme(defaultSpec())).toHaveLength(0);
  });

  it("flags unreadable text and a collapsed surface ladder", () => {
    const bad: ThemeSpec = {
      ...defaultSpec(),
      anchors: { ...defaultSpec().anchors, text: "#181c22" },
      overrides: { "surface-2": "#101418", "surface-3": "#101418" },
    };
    const findings = validateTheme(bad);
    expect(findings.some((f) => f.token === "text" && f.level === "error")).toBe(true);
    expect(findings.some((f) => f.token === "ladder")).toBe(true);
  });

  it("warns when the declared mode contradicts the background", () => {
    const mismatch = validateTheme({ ...defaultSpec(), mode: "light" });
    expect(mismatch.some((f) => f.token === "bg" && f.message.includes("declares light"))).toBe(true);
    expect(validateTheme(defaultSpec()).some((f) => f.message.includes("declares"))).toBe(false);
  });

  it("does not flag the library's own shipped themes as broken-by-default", () => {
    // Each shipped theme may earn warnings, but its errors must be the known
    // hand-tuned ones (ink/accent), never a structural surprise.
    for (const id of THEME_IDS) {
      const spec = specFromTokens(id, THEME_LABELS[id], byId[id]!);
      const errors = validateTheme(spec).filter((f) => f.level === "error" && f.token !== "accent-ink" && f.token !== "accent");
      expect(errors, `${id}: ${errors.map((e) => e.message).join("; ")}`).toHaveLength(0);
    }
  });
});

describe("shareable state", () => {
  it("survives an encode/decode cycle", () => {
    const spec: ThemeSpec = { ...defaultSpec(), id: "share-me", label: "Share Me" };
    expect(decodeSpec(encodeSpec(spec))).toEqual(spec);
  });

  it("returns null for junk instead of throwing", () => {
    expect(decodeSpec("not-base64!!")).toBeNull();
    expect(decodeSpec("e30")).toBeNull();
  });
});

describe("anchors", () => {
  it("are all tokens the emitter knows", () => {
    for (const anchor of ANCHORS) expect(THEME_TOKEN_ORDER).toContain(anchor);
  });

  it("are grouped exactly once for the editor", () => {
    const grouped = ANCHOR_GROUPS.flatMap((g) => g.keys);
    expect([...grouped].sort()).toEqual([...ANCHORS].sort());
  });

  it("plus the derived groups and the structural gradient cover every token", () => {
    const derived = DERIVED_GROUPS.flatMap((g) => g.tokens);
    expect([...ANCHORS, ...derived, "accent-gradient"].sort()).toEqual([...THEME_TOKEN_ORDER].sort());
    // the gradient is never editable, so it must not appear in a group
    expect(derived).not.toContain("accent-gradient");
  });

  it("can name a theme in one word, since ids appear in CSS selectors", () => {
    for (const anchor of ANCHORS) expect(anchor).toMatch(/^[a-z][a-z0-9-]*$/);
  });
});
