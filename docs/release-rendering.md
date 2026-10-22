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

Outputs (28 PNGs, committed):

- `docs/assets/theme-banner.png` — Tier 1: the theme showcase. Basic
  components (AppButton variants, AppInput, AppBadge/AppChip, AppToggle,
  AppIcon row) rendered as row items under all 16 themes as cards in **two
  rows of 8** — the dark themes first, then the remaining themes with all
  light themes (`light`, `pure-platinum`, `mint`, `sunshine`, `monotone`)
  grouped together at the end. The rows are curated in `BannerPrint.vue`, and
  the audit's `banner__col` count (=== `THEME_IDS.length`) fails if a new theme
  is not placed there — the banner cannot silently omit one. Embedded at the
  top of `README.md`.
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
3. Screenshots `#banner` / `#print-section` at
   `deviceScaleFactor: 2` with `prefers-reduced-motion` emulated (the kit
   zeroes every `--dur-*` under it). The banner renders at 1440×1000 (8 cards
   per row); family catalogue renders use a **1000×1000 viewport → two-column
   grids** (2 × ~455px cards), so no component sits in a third column beside a
   wide card and no section forces extra horizontal width. `.span-2`/`.span-3`
   cards become full rows; `.span-1` cards pair up automatically; lone cards
   get `span-2`.

## Catalogue quality

- **State coverage:** every component's notable states are represented in the
  renderings — accordion with one item open and others collapsed, trees with
  expanded/collapsed/disabled nodes, tabs with an active and a disabled tab,
  toggle/checkbox on-off trios, all badge/chip tints, determinate +
  indeterminate progress, paginator on page 2, a live ANSI-coloured Terminal
  feed, a LineChart with a gap + threshold, both Kanban boards, and open
  overlays (dialog, drawer, popover, confirm popup, context menu, toasts).
- **Compact layout:** family sections are CSS grids of 350px+ DemoCard cells
  (`.span-2`/`.span-3` for wide components), so renders carry no dead vertical
  space; the catalog is regenerated as one pass.
- **Print-only harness overrides** (scoped to `html[data-print]`, never in the
  kit): the Drawer renders at rest above the dialog scrim (`z-index: 1550`,
  backdrop hidden, transform pinned — reduced-motion zeroes `--dur-*`, which
  makes Vue's drawer `<Transition>` stick at its enter-from translate), and
  the Board section statically mounts TaskBoard + LaneBoard side by side (the
  mount-one-at-a-time rule applies to interactive use, where no static render
  conflicts).

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
  into per-component images if the README grows too heavy (27 catalogue
  images ≈ 6 MB now).
