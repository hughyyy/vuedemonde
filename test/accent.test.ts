// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { accentTokens, accentWarnings, applyAccent, contrastRatio, luminance, parseHex, shade, themeAccent, withAlpha } from "../src/accent";

describe("accentTokens (U12)", () => {
  it("derives a solid accent's full token set", () => {
    const t = accentTokens({ kind: "solid", color: "#4f9cf9" });
    expect(t.accent).toBe("#4f9cf9");
    expect(t.accent2).toBe("#4f9cf9");
    expect(t.gradient).toBe("linear-gradient(#4f9cf9, #4f9cf9)");
    expect(t.strong).not.toBe("#4f9cf9");
    expect(t.soft).toContain("rgba(");
    expect(t.ink).toBeTruthy();
  });

  it("derives a gradient's two-stop tokens", () => {
    const t = accentTokens({ kind: "gradient", from: "#4f9cf9", to: "#a06cf9" });
    expect(t.accent).toBe("#4f9cf9");
    expect(t.accent2).toBe("#a06cf9");
    expect(t.gradient).toBe("linear-gradient(#4f9cf9, #a06cf9)");
  });

  it("picks a dark ink on light accents and light ink on dark accents", () => {
    // light accent -> dark text
    expect(luminance(accentTokens({ kind: "solid", color: "#ffff00" }).ink)).toBeLessThan(0.5);
    // dark accent -> light text
    expect(luminance(accentTokens({ kind: "solid", color: "#0000aa" }).ink)).toBeGreaterThan(0.5);
  });

  it("applyAccent writes the CSS tokens onto a target element (runtime apply)", () => {
    const el = document.createElement("div");
    applyAccent({ kind: "solid", color: "#123456" }, el);
    expect(el.style.getPropertyValue("--accent")).toBe("#123456");
    expect(el.style.getPropertyValue("--accent-2")).toBe("#123456");
    // passing null hands the accent back to the theme (clears the override)
    applyAccent(null, el);
    expect(el.style.getPropertyValue("--accent")).toBe("");
  });
});

describe("accent colour primitives — parse/shade/contrast edge cases", () => {
  it("parseHex accepts #rgb, #rrggbb, bare hex, and trims whitespace", () => {
    expect(parseHex("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex("fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex(" #A1b2C3 ")).toEqual({ r: 0xa1, g: 0xb2, b: 0xc3 });
  });

  it("parseHex rejects malformed input", () => {
    expect(parseHex("#ggg")).toBeNull();
    expect(parseHex("#12345")).toBeNull();
    expect(parseHex("#1234567")).toBeNull();
    expect(parseHex("")).toBeNull();
    expect(parseHex("rgb(1,2,3)")).toBeNull();
  });

  it("luminance returns 0 for black, 1 for white, 0 for unparsable", () => {
    expect(luminance("#000000")).toBe(0);
    expect(luminance("#ffffff")).toBe(1);
    expect(luminance("nonsense")).toBe(0);
  });

  it("contrastRatio spans the WCAG range", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#000000", "#000000")).toBe(1);
  });

  it("shade shifts toward black/white, clamps to the ends, and passes through invalid input", () => {
    expect(shade("#ffffff", 0.5)).toBe("#808080");
    expect(shade("#000000", 1)).toBe("#000000");
    expect(shade("#000000", -1)).toBe("#ffffff");
    expect(shade("#123456", 0)).toBe("#123456");
    expect(shade("oops", 0.5)).toBe("oops");
  });

  it("withAlpha emits rgba and passes through invalid input", () => {
    expect(withAlpha("#123456", 0.14)).toBe("rgba(18, 52, 86, 0.14)");
    expect(withAlpha("oops", 0.5)).toBe("oops");
  });
});

describe("accentTokens — derived token edge cases", () => {
  it("chooses dark ink on light accents and white ink on dark accents", () => {
    expect(accentTokens({ kind: "solid", color: "#ffff00" }).ink).toBe("#08131f");
    expect(accentTokens({ kind: "solid", color: "#000080" }).ink).toBe("#ffffff");
  });

  it("strong darkens light accents and lightens dark accents", () => {
    const light = accentTokens({ kind: "solid", color: "#ffff00" });
    expect(luminance(light.strong)).toBeLessThan(luminance("#ffff00"));
    const dark = accentTokens({ kind: "solid", color: "#000080" });
    expect(luminance(dark.strong)).toBeGreaterThan(luminance("#000080"));
  });

  it("accentWarnings flags text risk and background blending independently", () => {
    // light-grey accent on white: blends into the bg (first warning), still
    // readable ink on itself (no text warning)
    const w = accentWarnings({ kind: "solid", color: "#eeeeee" }, "#ffffff");
    expect(w.some((m) => m.includes("close to the background"))).toBe(true);
    expect(w.some((m) => m.includes("hard to read"))).toBe(false);
    // #777777 (L≈0.185) on #5a5a5a (L≈0.102): white ink on the accent fails
    // 4.5:1 (≈4.47) AND the pair sits within 3:1 — both warnings fire
    const both = accentWarnings({ kind: "solid", color: "#777777" }, "#5a5a5a");
    expect(both).toHaveLength(2);
    expect(both[0]).toContain("hard to read");
    expect(both[1]).toContain("close to the background");
  });
});

describe("themeAccent — declared theme accents via CSSOM introspection", () => {
  it("reads :root for dark and [data-theme] blocks for other themes", () => {
    const style = document.createElement("style");
    style.textContent = `
      :root { --accent: #4f9cf9; --accent-2: #6aaefc; --bg: #101418; }
      [data-theme="thermal"] { --accent: #ff6a00; --bg: #1a0f08; }
    `;
    document.head.append(style);
    try {
      expect(themeAccent("dark")).toEqual({ from: "#4f9cf9", to: "#6aaefc", bg: "#101418" });
      expect(themeAccent("thermal")).toEqual({ from: "#ff6a00", to: "#ff6a00", bg: "#1a0f08" });
    } finally {
      style.remove();
    }
  });

  it("falls back to --accent when a theme declares no --accent-2", () => {
    const style = document.createElement("style");
    style.textContent = `[data-theme="matrix"] { --accent: #00ff41; --bg: #000000; }`;
    document.head.append(style);
    try {
      expect(themeAccent("matrix")).toEqual({ from: "#00ff41", to: "#00ff41", bg: "#000000" });
    } finally {
      style.remove();
    }
  });

  it("returns null when the theme block is absent or the sheet is unreadable", () => {
    const style = document.createElement("style");
    style.textContent = `:root { --accent: #4f9cf9; }`;
    document.head.append(style);
    try {
      // 'bubblegum' has no block in the injected sheet; :root block has no --bg but dark only matches :root
      const unknown = document.createElement("style");
      unknown.textContent = `[data-theme="bubblegum"] { color: red; }`;
      document.head.append(unknown);
      try {
        expect(themeAccent("bubblegum")).toBeNull();
      } finally {
        unknown.remove();
      }
    } finally {
      style.remove();
    }
  });
});
