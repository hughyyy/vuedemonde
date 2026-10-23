/**
 * The six themes the component catalogue renders — single source of truth.
 *
 * Order matters: the release renderer stitches a 3-column × 2-row composite, so
 * the first three (all dark) fill the top row and the last three (all light) the
 * bottom row. Changing this list reshapes every catalogue image.
 *
 * Consumed by `scripts/render-release.mjs` (Node) and
 * `audit/catalogue-audit.test.ts` (vitest) — one list, so the audit can never
 * cover a different theme set than the images.
 */
export const CATALOGUE_THEMES = ["dark", "thermal", "bubblegum", "light", "sunshine", "mint"];
