// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { accentTokens, applyAccent, luminance, themeAccent } from "../src/accent";

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
