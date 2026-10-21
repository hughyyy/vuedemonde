/**
 * Theme + accent types for the token system (extracted from the Nexus app's
 * `shared/types.ts` so `src/accent.ts` and the demo interface can use them
 * standalone). `src/theme.css` ships the concrete token values for every id
 * listed here.
 */

export const THEME_IDS = [
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
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** Narrow a value to a known theme id (servers/loaders fall back to "dark"). */
export function isThemeId(t: unknown): t is ThemeId {
  return typeof t === "string" && (THEME_IDS as readonly string[]).includes(t);
}

/** Display labels for the theme picker, in settings order. */
export const THEME_LABELS: Record<ThemeId, string> = {
  dark: "Dark (default)",
  light: "Light",
  "late-night": "Late Night (warm, low blue)",
  thermal: "Thermal",
  "neon-cyberpunk": "Neon Cyberpunk",
  grunge: "Grunge",
  granite: "Granite",
  classic: "Classic",
  "high-contrast": "High Contrast",
  bubblegum: "Bubblegum",
  matrix: "Matrix",
  "shining-gold": "Shining Gold",
  "pure-platinum": "Pure Platinum",
  mint: "Mint (light green)",
  sunshine: "Sunshine (warm light)",
  monotone: "Monotone (pure greyscale)",
};

/**
 * User-selectable accent: a single colour or a two-colour gradient. The stored
 * value is just the choice; `src/accent.ts` derives the CSS tokens from it.
 * Pure hex strings (`#rrggbb`).
 */
export type AccentChoice =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string };
