/**
 * Accent colour / gradient mechanics (U12).
 *
 * The accent is user-selectable: a single colour or a two-colour gradient. The
 * settings value stores only the choice; everything else is derived here so the
 * CSS token block stays declarative:
 *
 *   --accent          solid scalar (first stop) — used everywhere
 *   --accent-2        second gradient stop (== first when solid)
 *   --accent-gradient linear-gradient(first, second)
 *   --accent-strong   hover/pressed shade
 *   --accent-soft     tinted background for chips/rings
 *   --accent-ink      readable text on an accent fill (luminance-derived)
 *   --focus-ring      the accent's strong shade
 *
 * Pure functions, no DOM — unit tested; `applyAccent` is the only side-effecting
 * wrapper (sets the properties on a target element).
 */

import type { AccentChoice, ThemeId } from "./theme";

export type { AccentChoice }; // single source of truth lives in theme.ts

/** Resolved token values for one accent choice. */
export type AccentTokens = {
  accent: string;
  accent2: string;
  gradient: string;
  strong: string;
  soft: string;
  ink: string;
};

type Rgb = { r: number; g: number; b: number };

/** Parse `#rgb`, `#rrggbb` (and the same without `#`). Returns null when unparsable. */
export function parseHex(input: string): Rgb | null {
  const s = input.trim().replace(/^#/, "");
  const hex =
    s.length === 3
      ? s
          .split("")
          .map((c) => c + c)
          .join("")
      : s;
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  const part = (n: number): string =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** Relative luminance (WCAG 2.x), 0 (black) … 1 (white). */
export function luminance(color: string): number {
  const rgb = parseHex(color);
  if (!rgb) return 0;
  const channel = (v: number): number => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/** WCAG contrast ratio between two colours (1 … 21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Shift a colour toward black (`amount` > 0) or white (`amount` < 0). */
export function shade(color: string, amount: number): string {
  const rgb = parseHex(color);
  if (!rgb) return color;
  const target = amount >= 0 ? 0 : 255;
  const t = Math.abs(amount);
  return toHex({
    r: rgb.r + (target - rgb.r) * t,
    g: rgb.g + (target - rgb.g) * t,
    b: rgb.b + (target - rgb.b) * t,
  });
}

/** `rgba()` string for a colour at the given alpha. */
export function withAlpha(color: string, alpha: number): string {
  const rgb = parseHex(color);
  if (!rgb) return color;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Derive the full accent token set from a choice. Text on accent flips to
 * near-black on light accents and white on dark ones (luminance threshold at
 * the midpoint where contrast against both is closest to equal).
 */
export function accentTokens(choice: AccentChoice): AccentTokens {
  const first = choice.kind === "solid" ? choice.color : choice.from;
  const second = choice.kind === "solid" ? choice.color : choice.to;
  return {
    accent: first,
    accent2: second,
    gradient: `linear-gradient(${first}, ${second})`,
    // Dark accents lighten on hover, light accents darken — keeps the state
    // change visible in both directions.
    strong: luminance(first) > 0.5 ? shade(first, 0.2) : shade(first, -0.18),
    soft: withAlpha(first, 0.14),
    ink: luminance(first) > 0.45 ? "#08131f" : "#ffffff",
  };
}

/** Contrast warnings for a choice — empty when the accent is legible. */
export function accentWarnings(choice: AccentChoice, bg: string): string[] {
  const tokens = accentTokens(choice);
  const warnings: string[] = [];
  if (contrastRatio(tokens.ink, tokens.accent) < 4.5) {
    warnings.push("Text on this accent may be hard to read.");
  }
  const first = choice.kind === "solid" ? choice.color : choice.from;
  if (contrastRatio(first, bg) < 3) {
    warnings.push("This accent is close to the background — buttons and links may disappear.");
  }
  return warnings;
}

/**
 * Write the accent tokens onto an element (`:root` by default), overriding the
 * theme defaults from `design-tokens.css`. Pass a choice of `null` to hand the
 * accent back to the theme.
 */
export function applyAccent(choice: AccentChoice | null, target?: HTMLElement | null): void {
  const el = target ?? (typeof document === "undefined" ? null : document.documentElement);
  if (!el) return;
  const names = [
    "--accent",
    "--accent-2",
    "--accent-gradient",
    "--accent-strong",
    "--accent-soft",
    "--accent-ink",
    "--focus-ring",
  ] as const;
  if (!choice) {
    for (const n of names) el.style.removeProperty(n);
    return;
  }
  const t = accentTokens(choice);
  el.style.setProperty("--accent", t.accent);
  el.style.setProperty("--accent-2", t.accent2);
  el.style.setProperty("--accent-gradient", t.gradient);
  el.style.setProperty("--accent-strong", t.strong);
  el.style.setProperty("--accent-soft", t.soft);
  el.style.setProperty("--accent-ink", t.ink);
  el.style.setProperty("--focus-ring", t.strong);
}

/* ---------------------------------------------------------------------------
 * Theme accent introspection.
 *
 * `themeAccent()` reads a theme's *declared* accent straight from the
 * `theme.css` stylesheet (`[data-theme="…"]` blocks, `:root` for the default
 * dark theme) — the single source of truth. It deliberately does NOT use
 * `getComputedStyle`, because a user-selected accent (U12) is applied as an
 * inline override on `:root`, which would mask the theme's own colours. Used
 * by theme-picker UIs so the accent swatches reflect whatever the currently
 * selected theme actually declares.
 * ------------------------------------------------------------------------ */

/** A theme's declared accent (+ background), for accent pickers. */
export type ThemeAccent = { from: string; to: string; bg: string };

/**
 * The accent colours a theme declares in `theme.css`. Returns `null` when the
 * stylesheet cannot be read (cross-origin / pre-injection / test env) —
 * callers fall back to the running computed values.
 */
export function themeAccent(theme: ThemeId): ThemeAccent | null {
  if (typeof document === "undefined") return null;
  // dark lives on :root; every other theme has a dedicated [data-theme] block.
  const wanted = theme === "dark" ? ":root" : `[data-theme="${theme}"]`;
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList | undefined;
      try {
        rules = sheet.cssRules;
      } catch {
        rules = undefined; // cross-origin sheet — skip
      }
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule)) continue;
        if (rule.selectorText !== wanted) continue;
        const s = rule.style;
        const from = s.getPropertyValue("--accent").trim();
        if (!from) continue;
        const to = s.getPropertyValue("--accent-2").trim() || from;
        return { from, to, bg: s.getPropertyValue("--bg").trim() };
      }
    }
  } catch {
    // stylesheet unreadable — caller handles
  }
  return null;
}
