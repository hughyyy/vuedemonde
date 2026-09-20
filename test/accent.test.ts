// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { accentTokens, applyAccent, luminance } from "../src/accent";

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
