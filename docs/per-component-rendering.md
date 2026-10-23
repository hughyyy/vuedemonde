# Component catalogue images — per-component, six-theme re-render

**Status: implemented.** Tier 2 of the release renderer now produces one
composite image per exported component (106), each showing six themes in a 2×3
grid. This document records the design and the decisions that shaped it; the
implementation lives in `scripts/render-release.mjs`,
`scripts/catalogue-readme.mjs`, `scripts/catalogue-registry.mjs`, the demo SFCs
in `playground/src/catalogue/`, and the parity test + audit in
`test/catalogue-registry.test.ts` / `audit/catalogue-audit.test.ts`.

Related: `docs/release-rendering.md` (current implementation),
`docs/visual-regression.md` (the regression harness), `README.md` (the
consumer-facing catalogue table).

---

## 1. What changes

Two independent changes, both to Tier 2 (the component catalogue). Tier 1 (the
theme banner) is unchanged.

### 1.1 Theme set: six themes, three dark + three light

| | Dark | Light |
| --- | --- | --- |
| 1 | `dark` (default) | `light` |
| 2 | `thermal` | `sunshine` |
| 3 | `bubblegum` | `mint` |

Today the catalogue renders `light`, `dark`, `thermal`. The new set adds
`bubblegum` (dark) and `sunshine` + `mint` (light).

Rationale for this specific set. Accent hues measured from `src/theme.css`:

| Dark | Hue | Light | Hue |
| --- | --- | --- | --- |
| `dark` | 213° | `light` | 218° |
| `thermal` | 11° | `sunshine` | 32° |
| `bubblegum` | 317° | `mint` | 147° |

- **Polarity:** 3 dark / 3 light, so every component is seen under both
  `color-scheme`s and both `color-scheme`-dependent native-control paths.
- **Hue spread (dark):** 11°, 213°, 317° — gaps of 202°, 104°, 54°. The widest
  pair (red vs blue) plus a magenta; the 54° cluster (317°→11°) is the one
  weak spot in the set.
- **Hue spread (light):** 32°, 147°, 218° — gaps of 115°, 71°, 174°. Evenly
  spread, and every light hue is distinct from every dark hue except the two
  neutral blues (`dark` 213° / `light` 218°), which are deliberately the same
  family.
- **Contrast extremes:** `thermal` (max-saturation accents on near-black) and
  `sunshine` (warm low-saturation accents on near-white) are the two themes most
  likely to expose a component that assumes neutral greys. `bubblegum` adds a
  second, colder dark extreme.
- **Honest caveat:** the request's six are not optimised pairs. `bubblegum`
  (317°) and `mint` (147°) are near-opposite, so if the composite stacks dark
  over light, column 3 is a contrast *clash*, not a family pair. Only
  `dark`/`light` (213°/218°) and `thermal`/`sunshine` (11°/32°) are true hue
  pairs. **Recommendation: label each cell with its theme name and accept the
  mismatch** — the purpose here is coverage, not pairing. (If pairing matters
  more than the specified set, `bubblegum` would pair better with `sakura`
  (317°-family rose) than with `mint`; noting only so the tradeoff is explicit.)

`THEME_IDS` and the banner are untouched — this is a renderer-side list only.

### 1.1a Where the six-theme list lives

It must be **one exported constant**, consumed by the renderer, so it cannot
drift:

```ts
// scripts/catalogue-themes.mjs (or a shared constants module)
export const CATALOGUE_THEMES = ["dark", "thermal", "bubblegum", "light", "sunshine", "mint"];
```

The audit suite mounts family sections under its own list
(`audit/render-audit.test.ts`, `vitest.audit.config.ts` — currently
dark/light/thermal). Either source that list from the same constant or widen it
to all six; leaving two divergent lists is a maintenance trap.

### 1.2 Granularity: one image per component

Today: **9 family PNGs × 3 themes = 27 images**, where one image holds 5–8
`DemoCard`s. Consequences already visible in `docs/assets/`:

- An open `AppDialog`/`Drawer`/`ContextMenu` in the Overlays family floats over
  the sibling cards, hiding the very controls the image is meant to show. This
  is the reported complaint, and it is structural: the panels are
  `Teleport`ed to `body` (`src/kit/AppDialog.vue:64`, `Drawer.vue:64`,
  `Popover.vue:99`, `ToastHost.vue:9`) so no local stacking/Z-index tweak can
  keep them inside their own card region.
- A 2000×3542 PNG for a family means a reader scrolls past 5 unrelated
  components to find one.
- Cards sized for a shared grid (`.span-2`, `.span-3`) carry empty space when
  the component is small.

Desired: **one image per component, containing all six themes** side by side in
that single image. This is what the request asks for: "each component to be
given its own image — with each of the six specified themes displayed in the
single component-level image."

---

## 2. The hard constraint: teleported overlays

This is the single design problem to solve, and it blocks the naive approach.

**Verified fact:** `data-theme` is a CSS custom-property scope. `AppDialog`,
`Drawer`, `Popover`, `ToastHost`, `AppMenu`, `ContextMenu`, `ConfirmPopup`,
`CommandMenu`, `DatePicker`, `CascadeSelect`, `TreeSelect`, `TieredMenu` and
`MediaGallery` all render their panels through `<Teleport to="body">`. A
teleported panel therefore inherits from `<body>`, **not** from the
`data-theme` island wrapping its trigger.

Measured on the built demo: a `data-theme="mint"` island resolves `--bg:
#f0f7f2` for a child element, but an open dialog teleported out of that island
resolves `rgb(23, 28, 34)` — the page's `dark` theme — and has no theme
ancestor inside `#print-section`.

Consequence: **a six-theme composite built from `data-theme` islands will
render every overlay in the page theme, not the island theme.** The Overlays
family would show five correct light panels and one dark one, which is worse
than the current ambiguity.

### Options

| # | Approach | Verdict |
| --- | --- | --- |
| A | Six `data-theme` islands in one page, one per column | **Rejected.** Teleports escape to `body`; overlays render in the page theme. |
| B | One page load per theme, screenshot the component region, stitch the six crops side by side in Node | **Recommended.** Each load sets `data-theme` on `<html>`, so teleports inherit correctly. Stitching is deterministic and needs no new browser work. |
| C | Patch each overlay to accept a `container`/`appendTo` prop and teleport into the card | Rejected. Invasive kit-wide API change, 13 components, and it changes public behaviour for a docs-only need. |
| D | Render overlays inline (no teleport) via a print-only flag | Rejected. Would no longer render the real component; a doc render that lies about behaviour is worse than a cluttered one. |

**Decision: Option B.** One browser pass per theme → six real renders per
component → compose into a single PNG. This also keeps every image
representative of real behaviour.

---

## 3. Proposed architecture

### 3.1 New print route: single component

Add `?print=component&id=<component>&theme=<theme>` to `playground/src/App.vue`
alongside the existing `print=family` and `print=banner` routes.

- Renders exactly one component demo, not a family section.
- Sets `document.documentElement.dataset.theme` before paint (the existing
  `print=family` path already does this, `App.vue:37`).
- Sets `document.documentElement.dataset.print` so the existing print-only
  harness overrides apply (`App.vue:38`).

The demo must be able to open its own overlay states. Today that logic lives in
each section's `onMounted` guarded by `props.print` (e.g.
`OverlaysSection.vue:56-79`). The single-component route needs the same, so the
component-demo registry (3.2) should expose an `openStates()` hook rather than
duplicating the `onMounted` blocks.

### 3.2 Component demo registry

The current sections are hand-written `.vue` files whose cards are inline
template markup; there is no machine-readable list of "component → demo". That
registry is the main piece of new work.

Proposed: `playground/src/catalogue/<Component>.demo.vue` — one SFC per
component, exporting

```ts
// each demo declares its own states; the renderer drives both
defineProps<{ print?: boolean }>();
```

plus a generated index (`playground/src/catalogue/index.ts`) mapping
`componentId → { label, group, demo, size }`.

Migration note: the 57 existing `DemoCard`s already contain most of the markup,
so this is largely a move-and-split (45 of 106 exports already have a dedicated
card). The sections stay as live pages (they are the demo site's browsing UI)
and can be rebuilt from the registry later; **do not delete the sections as
part of the first cut** — the registry should be extracted from them so the two
cannot drift.

Counts, measured:

| Group | Components exported | Demo cards in template | Rendered live |
| --- | --- | --- | --- |
| Primitives | 10 | 8 | 8 |
| Inputs & Forms | 29 | 8 | 8 |
| Overlays & Feedback | 11 | 7 | 7 |
| Navigation | 12 | 5 | 5 |
| Data Display | 16 | 8 | 8 |
| Layout | 18 | 7 | 7 |
| Charts | 6 | 5 | 5 |
| Calendar | 7 | 6 | 6 |
| Board | 3 | 3 | 1 |
| **Total** | **106** | **57** | **55** |

57 cards cover 106 exports because many cards group siblings
("Tree / TreeTable / TreeSelect", "OrderList / PickList / DataView").

**Board is a special case worth planning for:** `BoardSection.vue` branches on
`props.print` — in print mode it mounts `TaskBoard` and `LaneBoard` as two
separate cards, interactive mode shows one card with tabs (the kit's drag
engine is a module singleton, so only one board may mount at a time). Verified
live: 55 `.demo` cards render interactively vs 57 in the template. Any
per-component route inherits the same constraint: **TaskBoard and LaneBoard must
be separate page loads, never two columns of one composite.**

**Decision (confirmed): per exported component — 106 images.** Every
`export { default as … }` in the four barrels gets its own six-theme composite,
including components currently bundled inside grouped cards and components with
no demo at all. This is the literal reading of "each component to be given its
own image", and it makes the catalogue table exhaustive — a reader can find any
exported component by name, which the current family images cannot offer.

### 3.2a Inventory: what the 106 images decompose into

Measured from the four barrels (`src/kit/index.ts` 87, `src/charts/index.ts` 5,
`src/calendar/index.ts` 8, `src/board/index.ts` 6) against the live playground:

Exact bucket counts (106 = 45 + 53 + 8; cross-checked per-card, `title`
matched against the component rendered in that card):

| Bucket | Count | What it means |
| --- | --- | --- |
| Dedicated card already exists | **45** | demo markup exists; move it into the registry. Full list: `AppAvatar`, `AppBadge`, `AppButton`, `AppChip`, `AppDialog`, `AppIcon`, `AppMessage`, `AppProgress`, `AppTabs`, `AppTooltip`, `AppVirtualList`, `BarChart`, `BlockUI`, `Breadcrumb`, `CalendarToolbar`, `Carousel`, `CommandMenu`, `DataTable`, `DayCalendar`, `Divider`, `DonutChart`, `Drawer`, `EventTile`, `FileUpload`, `LaneBoard`, `LineChart`, `Menubar`, `MeterGroup`, `MonthCalendar`, `OrderList`, `OrgChart`, `PaneSection`, `Popover`, `RadarChart`, `SchedulerView`, `Splitter`, `Stepper`, `TaskBoard`, `Terminal`, `TextEditor`, `ToastHost`, `Toolbar`, `Tree`, `VirtualScroller`, `WeekCalendar` |
| Structural child / grouped | **53** | rendered today only as a member of a multi-component card or as another demo's chrome; needs its own demo. `AppAccordion`, `AppCheckbox`, `AppInput`, `AppMenu`, `AppOptionInput`, `AppPanel`, `AppRadio`, `AppSearchInput`, `AppSelect`, `AppTextarea`, `AppToggle`, `AutoComplete`, `AvatarStack`, `Card`, `CascadeSelect`, `ChartLegend`, `Compare`, `ConfirmPopup`, `ContextMenu`, `DataView`, `DatePicker`, `DeferredContent`, `Dock`, `EventChip`, `Fieldset`, `FloatLabel`, `Fluid`, `IconField`, `IftaLabel`, `Inplace`, `InputColor`, `InputGroup`, `InputNumber`, `InputOtp`, `InputPassword`, `InputTags`, `Knob`, `Listbox`, `MediaGallery`, `MegaMenu`, `Paginator`, `PickList`, `Rating`, `ScrollArea`, `ScrollTop`, `SelectButton`, `Skeleton`, `Slider`, `TieredMenu`, `Timeline`, `ToggleButton`, `TreeSelect`, `TreeTable` |
| No demo occurrence at all | **8** | genuinely new writing (below) |

`AppButton` deserves a note: it appears in 9 cards but as a *trigger*; its
dedicated demo is one of the 45 above. The 45/53 split is "subject of a card",
not "mentioned in a card".

The 8 with **no demo at all** are the genuinely new writing work:

- `AppEmptyState` — real component; needs a first demo.
- `BoardCard`, `BoardColumn`, `BoardToolbar`, `TaskDialog`, `EventDialog` —
  internal building blocks of Board/Calendar. They render today only as
  children of `TaskBoard`/`LaneBoard`/`SchedulerView`; per-component images
  require a minimal synthetic state each (a seed card for `BoardCard`,
  sample stats for `BoardToolbar`, …).
- `ConfirmDialog`, `DialogHost` — service hosts (`confirm()`/`openDialog()`
  mount them implicitly from `src/kit/confirm.ts` / `dialogs.ts`). No static
  appearance of their own; an image is only meaningful *with* an open dialog
  driven through the service. **Decision needed:** render them live in print
  mode (open `confirm()`/`openDialog()` programmatically), or list as
  "service-managed — no static image".

**Measurement caveat:** naive "component appears in a section" counts massively
overstate demo ownership (`AppButton` is in 9 cards, most as a trigger). The
table above is per-card truth: a component counts a bucketed demo only when it
is the *subject* of the card, cross-checked against the section markup rather
than a file-level grep.

### 3.3 Renderer changes (`scripts/render-release.mjs`)

```
for each component in registry:            # sequential; one browser context
  for each theme in SIX_THEMES:            # dark, thermal, bubblegum, light, sunshine, mint
    goto ?print=component&id=X&theme=T
    screenshot the component root element  # element shot, not viewport
  compose 6 crops side by side → docs/assets/component-<id>.png
```

Details that must be pinned:

- **One `goto` per theme** (6 per component). At 106 components the cost is
  **636 page loads**. At the observed ~0.35 s/load in the existing harness that
  is ≈ 4 min plus build time — acceptable for a release-time task, and it stays
  parallelisable across components later (the harness already runs families
  sequentially; a `--only=<id>` flag keeps iteration cheap).
- **Content-driven crop (implemented).** Each demo lays out at its own width
  (`shot`, `wide` → 780 px, else 520 px) but the screenshot is cropped to the
  **painted content**, not to that frame:
  - the demo's painted children, plus any body-level overlay layer
    (dialog scrim → its panel, drawer, toast stack, popover) are unioned;
  - a full-viewport layer is treated as a scrim and measured by its visible
    panels, so a centred modal crops to the dialog rather than the screen;
  - static wrappers such as the Vue mount root are ignored — unioning them
    would stretch every crop to the page width (this was a real bug: it made
    every cell ~3× taller and wider than its content).
  Overlay demos additionally render at a 460 px viewport so a viewport-centred
  panel does not leave ~400 px of empty backdrop inside the crop.
  Rows (`width: max-content`) and columns hug their controls so demos do not
  inflate the measured box either.
- **Per-row/column alignment:** cells keep their own size; each column is as
  wide as its widest cell and each row as tall as its tallest, and narrower
  content is centred in its cell. No demo is stretched to a global maximum.
- **Compose in Node**, not in the browser: read the six PNGs with the existing
  `pngjs` dependency (already used by `visual-compare.mjs`) and blit into one
  canvas with a labelled gutter. No new dependency. **Verified:** a 3×2 blit of
  six crops encodes byte-identically on repeated runs (`Buffer.compare` → 0),
  so composites are reproducible and safe to commit.
- **Labels:** each column carries the theme label (`THEME_LABELS[id]`), drawn by
  the page itself in a header row so text rendering matches the library, not by
  the Node blitter.
- **Determinism:** keep the existing invariants — `deviceScaleFactor: 2`,
  `reducedMotion: "reduce"`, `await document.fonts.ready`, 120 ms settle,
  `page.clock.install()` for date-dependent components. The six per-theme loads
  must each reset pointer position (`page.mouse.move(0, 0)`) for the same
  `:hover` reason documented in `docs/visual-regression.md` invariant #2.

### 3.4 Output naming and README

```
docs/assets/component-<component-id>.png        # 6-theme composite, one per component
```

The README's catalogue section becomes a per-group list of component images
rather than a 9-row × 3-column table. At 106 images the group tables run ~18
rows of 6; if that makes the README too long, the full per-component gallery
moves to the GitHub Pages demo (`docs/github-pages.md`) and the README keeps a
curated subset. Suggested shape (WebP, subdirectory):

```markdown
### Buttons & badges
| AppButton | AppBadge | AppChip |
| --- | --- | --- |
| ![](docs/assets/components/app-button.webp) | ![](docs/assets/components/app-badge.webp) | ![](docs/assets/components/app-chip.webp) |
```

**Size is the open risk.** Measured from the current assets: 11.0 MB of
catalogue PNGs for 171 card-renders ≈ **63 KB per card-render**, so a six-theme
composite ≈ 375 KB. Across 106 components that is **≈ 40 MB of PNG** — up from
11 MB. Mitigations, in order of preference:

1. The composite is one image per component, so the *same* pixels are no longer
   duplicated across three theme files. At 106 components the growth is
   **106 × ~375 KB ≈ 40 MB PNG** vs the current 11 MB.
2. Encode composites as WebP `-quality 65` (measured: 340 KB PNG → **114 KB**
   WebP, SSIM 0.9999 on the current catalogue image) → 106 × ≈ 125 KB ≈
   **13 MB total** — only slightly above today's 11 MB, for 4× the components
   and 2× the themes. GitHub renders WebP in Markdown.
3. Or drop the committed images to `deviceScaleFactor: 1` (≈ 4× smaller) and
   keep DPR 2 only for the banner.

**Recommendation: WebP at quality 65, committed, with PNG as the renderer's
intermediate.** Keeps the README light while showing six themes at full
fidelity.

---

## 4. Verification plan (for when this is built)

- `npm run test:audit` must still pass (it mounts every family under
  dark/light/thermal; if the six-theme set replaces that list, update
  `audit/render-audit.test.ts` and `vitest.audit.config.ts` in the same change).
- New assertion: the **registry count equals the barrel export count (106)**
  — every `export { default as … }` from `src/kit/index.ts`,
  `src/charts/index.ts`, `src/calendar/index.ts`, `src/board/index.ts` has
  exactly one registry entry, failing loudly on a missing or duplicate demo
  (the same guarantee the banner already has via its `banner__col` count).
  This makes the decision self-enforcing: adding a component without a demo
  breaks the build.
- Every composite is the same nominal width, six columns, and non-zero height.
- Overlay components specifically: assert the panel is visible **and** that its
  computed `--bg` matches the theme column it sits in (the exact bug Option A
  would have shipped).
- `npm run visual:test` continues to gate the family/banner frames; the
  per-component composites are release artefacts, not regression frames, unless
  we later add them to the harness (out of scope here).

---

## 5. Decisions (resolved during implementation)

1. **106 images — per exported component.** The grouped cards were split and
   all 8 no-demo components got demos. Enforced by `test/catalogue-registry.test.ts`.
2. **Composite orientation — 2 × 3, dark row first.** Dark (`dark`, `thermal`,
   `bubblegum`) above light (`light`, `sunshine`, `mint`); labels drawn by the
   page so they use the theme's own typography.
3. **Output — `docs/assets/components/<kebab-id>.webp`**, WebP encoded by the
   headless browser (no ImageMagick dependency). Measured: 106 files ≈ 10 MB.
4. **Family PNGs — removed.** Once the README led with per-component images,
   the 27 family PNGs became unreferenced (11 MB of dead weight). They were
   deleted; the `?print=family` route remains (the visual-regression harness
   still mounts family sections for its own regression frames, which are
   independent of `docs/assets/`).
5. **Service hosts** (`ConfirmDialog`, `DialogHost`) — rendered live in print
   mode: each fires its real `confirm()`/`openDialog()` call and leaves the
   prompt open, so the host appears exactly as a caller sees it.
