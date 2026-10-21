# Release rendering script

**Status: implemented.** `scripts/render-release.mjs` generates the visual
showcase images committed under `docs/assets/` and embedded in `README.md`.
Run it when preparing a release — or any time a component or theme changes —
and commit the regenerated PNGs alongside the change.

## Running

```bash
npm install                       # once; includes playwright (devDependency)
npx playwright install chromium   # once; downloads the headless browser
npm run render:release            # Tier 1 banner + Tier 2 catalogue
# or selectively:
npm run render:release banner     # Tier 1 only
npm run render:release catalogue  # Tier 2 only
```

Outputs (29 PNGs, committed):

- `docs/assets/theme-banner-1.png` + `theme-banner-2.png` — Tier 1: the theme
  showcase. Basic components (AppButton variants, AppInput, AppBadge/AppChip,
  AppToggle, AppIcon row) rendered as row items under all 13 themes as
  columns; split into two images (7 + 6 columns) so each fits a README half.
  Embedded at the top of `README.md`.
- `docs/assets/catalogue-<family>-<theme>.png` — Tier 2: every component
  family (primitives, inputs, overlays, navigation, data, layout, charts,
  calendar, board) under the three catalogue themes (light, dark default,
  thermal). Embedded as a 9-row table in the README's Visual catalogue
  section.

## How it works

1. Builds the playground (`vite build --config vite.demo.config.ts` →
   `dist-demo`) and serves it with `vite preview` on a fixed port.
2. Drives headless Chromium (Playwright) against the playground's print
   routes, added for exactly this purpose:
   - `?print=banner` → `BannerPrint.vue`: each theme is a `data-theme`
     **island** (a wrapper div carrying the attribute), so the CSS token
     blocks in `theme.css` cascade per column and one page shows every theme.
   - `?print=family&id=<id>&theme=<theme>` → renders only that family section,
     with the theme applied to `<html>` before first paint. The route never
     restores localStorage over a print request.
3. Screenshots `#banner-a` / `#banner-b` / `#print-section` at
   `deviceScaleFactor: 2` with `prefers-reduced-motion` emulated (the kit
   zeroes every `--dur-*` under it) and a fixed 1440×1000 viewport.

## Reproducibility

- Fixed viewport + device scale + reduced motion: image diffs across releases
  show only real visual changes.
- **Known variance:** the calendar section seeds events around the *current*
  date, so its month grid shifts monthly by design (`seedEvents(new Date())`).
- The chart/board sections are deterministic (`seedBoard()`, fixed seed data).

## Open items (not required for the first cut)

- CI enforcement: a job that re-runs `render:release` and fails on a PNG diff
  would catch stale images automatically.
- Tier 2 granularity is family-level today; very large families could split
  into per-component images if the README grows too heavy (27 images ≈ 6 MB
  now).
