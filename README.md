# Vue de monde

A lightweight Vue 3 component + design-token library, extracted from (and built
through) the Nexus visual-editor app's custom UI kit. Every component is a
hand-written SFC that reads CSS custom-property tokens from a single theme
stylesheet — no UI-library dependency, no runtime CSS-in-JS, just Vue.

Published as the npm package **`vuedemonde`**.

<p align="center">
  <img src="docs/assets/theme-banner.png" width="100%" alt="All 24 themes: two rows of 12 theme cards — all 12 dark themes first, then all 12 light themes, each column pairing a dark theme with its light counterpart" />
</p>

```bash
npm install            # dev deps
npm run dev            # the playground (localhost:5199)
npm run typecheck      # vue-tsc over src/playground/test
npm test               # vitest (unit tests for the pure helpers + components)
npm run build          # library → dist/ (ESM + CSS + d.ts)
```

## Install & use

```ts
// any Vue 3 (≥3.5) project
import { AppButton, DataTable, notify, THEME_LABELS } from "vuedemonde";
import "vuedemonde/theme.css";  // required — the tokens + 24 themes
import "vuedemonde/kit.css";    // optional — global helpers (board drag, ripple)

createApp(App).use(FormDirectives).mount("#app"); // optional: v-mask/v-key-filter/v-ripple...
```

The library is ESM (`.js` + `.d.ts`), so consume it through a bundler (Vite, etc.).
`vue` is a peer dependency. Component styles ship in `vuedemonde.css`; the token
sheet (`theme.css`) and the optional helpers (`kit.css`) are separate files and
must be imported explicitly — load your own theme override after `theme.css`.

## Theming

- One stylesheet drives everything: `:root` = dark by default; each `[data-theme="…"]`
  block redefines the colour tokens. Set `document.documentElement.dataset.theme`
  to switch: `dark`, `light`, `late-night`, `thermal`, `neon-cyberpunk`, `grunge`,
  `granite`, `classic`, `high-contrast`, `amethyst`, `bubblegum`, `matrix`,
  `shining-gold`, `pure-platinum`, `mint`, `sunshine`, `monotone`, `sakura`,
  `lavender`, `lagoon`, `citron`, `clay`, `gilt`, `high-contrast-light`.
- `src/theme.ts` exports `THEME_IDS`, `THEME_LABELS`, `isThemeId`, and the
  `AccentChoice` type for building your own picker.
- User accent: `applyAccent({ kind: "solid", color })` or
  `applyAccent({ kind: "gradient", from, to })` derives `--accent`, `--accent-2`,
  `--accent-gradient`, `--accent-strong`, `--accent-soft`, `--accent-ink` and
  `--focus-ring` and writes them to `:root`; `applyAccent(null)` resets.
  `themeAccent(themeId)` reads a theme's *declared* accent straight from the
  stylesheet (for theme pickers that must ignore a running user override).
- Reduced motion is built in: under `prefers-reduced-motion` all `--dur-*` go to `0ms`.
- Each block also declares `color-scheme` (`light` for `light`, `pure-platinum`,
  `mint`, `sunshine`, `monotone`, `sakura`, `lavender`, `lagoon`, `citron`,
  `clay`, `gilt`, `high-contrast-light`; `dark` otherwise) so native controls,
  scrollbars and form widgets match the palette.

### Building a theme

`npm run dev` → **`/?build`** — pick the anchors (background, surfaces, text,
accent pair, status colours, links), and the remaining tokens derive from them:
the surface and text ladders, line weights, `--accent-strong/-soft/-ink`,
the `*-soft` tints and the three shadows. Any derived token can be unlocked and
overridden; a shipped theme can be loaded as a starting point, and the draft is
shareable as a link.

The preview is a miniature app shell rather than a swatch grid, because the
surface tokens only make sense nested: `--bg` is the page, `--surface-1` the top
bar/sidebar/cards, and `--canvas-bg` the work area the cards sit on (it has one
consumer in the kit — `TextEditor`'s code blocks — so it is the *content*
surface, not the page background). A clipped scrim + dialog specimen covers
`--overlay`, and `--link`/`--reasoning` are drawn explicitly since no component
consumes them yet.

Three export forms come out of the same block:

| Mode | Selector | Use |
| --- | --- | --- |
| Selectable | `[data-theme="id"]` | pasted into `src/theme.css` + registered in `src/theme.ts` |
| Fixed | `:root` | a follow-on stylesheet imported after `theme.css`; locks the app to the palette |
| Default | `:root:not([data-theme])` | applies until something selects a theme; still overridable |

The export pane carries the CSS, the registration lines and the docs checklist
(theme list + the "24 themes" counts + banner regeneration). Contrast is
reported against the shipped themes' own envelope — informational, never
blocking. See `docs/theme-builder.md` for the token model and the derivation
proportions.

## The playground

`npm run dev` also opens the lightweight interactive catalogue (`playground/`)
that dogfoods the library: every family is a live, editable example with a theme
and accent switcher in the header. The theme builder is the same dev server at
`/?build`.

> **Planned:** a hosted demo on GitHub Pages so the catalogue and the theme
> builder can be tried without cloning. Feasibility, the workflow, and the one
> config change it needs are in
> [`docs/github-pages.md`](docs/github-pages.md). No site is deployed yet.

## Component inventory

### Primitives
`AppButton` · `AppIcon` · `AppBadge` · `AppChip` · `AppAvatar` / `AvatarStack` ·
`AppMessage` · `AppProgress` · `Skeleton` · `Divider`

### Inputs & forms
`AppInput` · `AppTextarea` · `AppSelect` · `AppSearchInput` · `AppOptionInput` ·
`AppCheckbox` · `AppToggle` ·
`AppRadio` · `ToggleButton` · `SelectButton` · `Listbox` · `AutoComplete` ·
`InputNumber` · `Slider` · `Rating` · `Knob` · `Compare` · `InputColor` ·
`InputTags` · `DatePicker` · `InputOtp` · `InputPassword` · `InputGroup` ·
`IconField` · `FloatLabel` · `IftaLabel` · `Inplace` · `CascadeSelect` ·
`FileUpload` + `v-mask` / `v-key-filter` directives

### Overlays & feedback
`AppDialog` · `Drawer` · `Popover` · `ConfirmPopup` · `ConfirmDialog` (promise
`confirm()`) · `DialogHost` (dynamic `openDialog()`) · `ToastHost` (`notify()`) ·
`ContextMenu` · `CommandMenu` · `BlockUI` · `AppTooltip`

### Navigation
`AppTabs` · `AppAccordion` · `AppMenu` · `Menubar` · `TieredMenu` · `MegaMenu` ·
`Dock` · `Breadcrumb` · `Carousel` · `ScrollTop` · `DeferredContent`

### Data display
`DataTable` · `Paginator` · `DataView` · `VirtualScroller` · `AppVirtualList`
(dynamic-height virtualiser) · `Tree` · `TreeTable` · `TreeSelect` ·
`OrderList` · `PickList` · `Timeline` · `Terminal` (streaming ANSI, tabs,
transports) · `TextEditor` · `OrgChart` · `MeterGroup`

### Layout
`AppPanel` · `Card` · `Fieldset` · `Splitter` · `ScrollArea` · `Toolbar` ·
`Fluid` · `Stepper` · `MediaGallery` · `PaneSection`

### Charts (dependency-free inline SVG)
`BarChart` · `LineChart` (gap-aware: `null` points break the line, dashed
threshold rules, epoch-time axis) · `DonutChart` · `RadarChart` · `ChartLegend`

### Calendar
`MonthCalendar` · `WeekCalendar` · `DayCalendar` · `SchedulerView` ·
`CalendarToolbar` · `EventChip` / `EventTile` / `EventDialog`

### Board (kanban, pointer drag & drop)
`TaskBoard` · `LaneBoard` — both share one drag engine; mount one at a time on
any route (their drop handlers are a module singleton).

## Visual catalogue

Every exported component has its own image showing **six themes** — the dark row
(`dark`, `thermal`, `bubblegum`) above the light row (`light`, `sunshine`,
`mint`). Regenerate whenever a component or theme changes:
`npm run render:release` (see `docs/release-rendering.md` and
[`docs/per-component-rendering.md`](docs/per-component-rendering.md)).

<!-- catalogue:start -->
All **106 exported components** in six themes each — dark row
(`dark` / `thermal` / `bubblegum`) above light row (`light` / `sunshine` / `mint`).
Regenerate with `npm run render:release && node scripts/catalogue-readme.mjs`.

### Primitives

#### AppAvatar

![AppAvatar — six themes](docs/assets/components/app-avatar.webp)

#### AppBadge

![AppBadge — six themes](docs/assets/components/app-badge.webp)

#### AppButton

![AppButton — six themes](docs/assets/components/app-button.webp)

#### AppChip

![AppChip — six themes](docs/assets/components/app-chip.webp)

#### AppEmptyState

![AppEmptyState — six themes](docs/assets/components/app-empty-state.webp)

#### AppIcon

![AppIcon — six themes](docs/assets/components/app-icon.webp)

#### AppMessage

![AppMessage — six themes](docs/assets/components/app-message.webp)

#### AppProgress

![AppProgress — six themes](docs/assets/components/app-progress.webp)

#### AvatarStack

![AvatarStack — six themes](docs/assets/components/avatar-stack.webp)

#### ConfirmDialog

![ConfirmDialog — six themes](docs/assets/components/confirm-dialog.webp)

#### DialogHost

![DialogHost — six themes](docs/assets/components/dialog-host.webp)

#### Divider

![Divider — six themes](docs/assets/components/divider.webp)

#### Skeleton

![Skeleton — six themes](docs/assets/components/skeleton.webp)

### Inputs & Forms

#### AppCheckbox

![AppCheckbox — six themes](docs/assets/components/app-checkbox.webp)

#### AppInput

![AppInput — six themes](docs/assets/components/app-input.webp)

#### AppOptionInput

![AppOptionInput — six themes](docs/assets/components/app-option-input.webp)

#### AppRadio

![AppRadio — six themes](docs/assets/components/app-radio.webp)

#### AppSearchInput

![AppSearchInput — six themes](docs/assets/components/app-search-input.webp)

#### AppSelect

![AppSelect — six themes](docs/assets/components/app-select.webp)

#### AppTextarea

![AppTextarea — six themes](docs/assets/components/app-textarea.webp)

#### AppToggle

![AppToggle — six themes](docs/assets/components/app-toggle.webp)

#### AutoComplete

![AutoComplete — six themes](docs/assets/components/auto-complete.webp)

#### CascadeSelect

![CascadeSelect — six themes](docs/assets/components/cascade-select.webp)

#### Compare

![Compare — six themes](docs/assets/components/compare.webp)

#### DatePicker

![DatePicker — six themes](docs/assets/components/date-picker.webp)

#### FileUpload

![FileUpload — six themes](docs/assets/components/file-upload.webp)

#### FloatLabel

![FloatLabel — six themes](docs/assets/components/float-label.webp)

#### IconField

![IconField — six themes](docs/assets/components/icon-field.webp)

#### IftaLabel

![IftaLabel — six themes](docs/assets/components/ifta-label.webp)

#### Inplace

![Inplace — six themes](docs/assets/components/inplace.webp)

#### InputColor

![InputColor — six themes](docs/assets/components/input-color.webp)

#### InputGroup

![InputGroup — six themes](docs/assets/components/input-group.webp)

#### InputNumber

![InputNumber — six themes](docs/assets/components/input-number.webp)

#### InputOtp

![InputOtp — six themes](docs/assets/components/input-otp.webp)

#### InputPassword

![InputPassword — six themes](docs/assets/components/input-password.webp)

#### InputTags

![InputTags — six themes](docs/assets/components/input-tags.webp)

#### Knob

![Knob — six themes](docs/assets/components/knob.webp)

#### Listbox

![Listbox — six themes](docs/assets/components/listbox.webp)

#### Rating

![Rating — six themes](docs/assets/components/rating.webp)

#### SelectButton

![SelectButton — six themes](docs/assets/components/select-button.webp)

#### Slider

![Slider — six themes](docs/assets/components/slider.webp)

#### ToggleButton

![ToggleButton — six themes](docs/assets/components/toggle-button.webp)

### Overlays & Feedback

#### AppDialog

![AppDialog — six themes](docs/assets/components/app-dialog.webp)

#### AppTooltip

![AppTooltip — six themes](docs/assets/components/app-tooltip.webp)

#### BlockUI

![BlockUI — six themes](docs/assets/components/block-ui.webp)

#### CommandMenu

![CommandMenu — six themes](docs/assets/components/command-menu.webp)

#### ConfirmPopup

![ConfirmPopup — six themes](docs/assets/components/confirm-popup.webp)

#### ContextMenu

![ContextMenu — six themes](docs/assets/components/context-menu.webp)

#### Drawer

![Drawer — six themes](docs/assets/components/drawer.webp)

#### Popover

![Popover — six themes](docs/assets/components/popover.webp)

#### ToastHost

![ToastHost — six themes](docs/assets/components/toast-host.webp)

### Navigation

#### AppAccordion

![AppAccordion — six themes](docs/assets/components/app-accordion.webp)

#### AppMenu

![AppMenu — six themes](docs/assets/components/app-menu.webp)

#### AppTabs

![AppTabs — six themes](docs/assets/components/app-tabs.webp)

#### Breadcrumb

![Breadcrumb — six themes](docs/assets/components/breadcrumb.webp)

#### Carousel

![Carousel — six themes](docs/assets/components/carousel.webp)

#### DeferredContent

![DeferredContent — six themes](docs/assets/components/deferred-content.webp)

#### Dock

![Dock — six themes](docs/assets/components/dock.webp)

#### MegaMenu

![MegaMenu — six themes](docs/assets/components/mega-menu.webp)

#### Menubar

![Menubar — six themes](docs/assets/components/menubar.webp)

#### ScrollTop

![ScrollTop — six themes](docs/assets/components/scroll-top.webp)

#### TieredMenu

![TieredMenu — six themes](docs/assets/components/tiered-menu.webp)

### Data Display

#### AppVirtualList

![AppVirtualList — six themes](docs/assets/components/app-virtual-list.webp)

#### DataTable

![DataTable — six themes](docs/assets/components/data-table.webp)

#### DataView

![DataView — six themes](docs/assets/components/data-view.webp)

#### MeterGroup

![MeterGroup — six themes](docs/assets/components/meter-group.webp)

#### OrderList

![OrderList — six themes](docs/assets/components/order-list.webp)

#### OrgChart

![OrgChart — six themes](docs/assets/components/org-chart.webp)

#### Paginator

![Paginator — six themes](docs/assets/components/paginator.webp)

#### PickList

![PickList — six themes](docs/assets/components/pick-list.webp)

#### Terminal

![Terminal — six themes](docs/assets/components/terminal.webp)

#### TextEditor

![TextEditor — six themes](docs/assets/components/text-editor.webp)

#### Timeline

![Timeline — six themes](docs/assets/components/timeline.webp)

#### Tree

![Tree — six themes](docs/assets/components/tree.webp)

#### TreeSelect

![TreeSelect — six themes](docs/assets/components/tree-select.webp)

#### TreeTable

![TreeTable — six themes](docs/assets/components/tree-table.webp)

#### VirtualScroller

![VirtualScroller — six themes](docs/assets/components/virtual-scroller.webp)

### Layout

#### AppPanel

![AppPanel — six themes](docs/assets/components/app-panel.webp)

#### Card

![Card — six themes](docs/assets/components/card.webp)

#### Fieldset

![Fieldset — six themes](docs/assets/components/fieldset.webp)

#### Fluid

![Fluid — six themes](docs/assets/components/fluid.webp)

#### MediaGallery

![MediaGallery — six themes](docs/assets/components/media-gallery.webp)

#### PaneSection

![PaneSection — six themes](docs/assets/components/pane-section.webp)

#### ScrollArea

![ScrollArea — six themes](docs/assets/components/scroll-area.webp)

#### Splitter

![Splitter — six themes](docs/assets/components/splitter.webp)

#### Stepper

![Stepper — six themes](docs/assets/components/stepper.webp)

#### Toolbar

![Toolbar — six themes](docs/assets/components/toolbar.webp)

### Charts

#### BarChart

![BarChart — six themes](docs/assets/components/bar-chart.webp)

#### ChartLegend

![ChartLegend — six themes](docs/assets/components/chart-legend.webp)

#### DonutChart

![DonutChart — six themes](docs/assets/components/donut-chart.webp)

#### LineChart

![LineChart — six themes](docs/assets/components/line-chart.webp)

#### RadarChart

![RadarChart — six themes](docs/assets/components/radar-chart.webp)

### Calendar

#### CalendarToolbar

![CalendarToolbar — six themes](docs/assets/components/calendar-toolbar.webp)

#### DayCalendar

![DayCalendar — six themes](docs/assets/components/day-calendar.webp)

#### EventChip

![EventChip — six themes](docs/assets/components/event-chip.webp)

#### EventDialog

![EventDialog — six themes](docs/assets/components/event-dialog.webp)

#### EventTile

![EventTile — six themes](docs/assets/components/event-tile.webp)

#### MonthCalendar

![MonthCalendar — six themes](docs/assets/components/month-calendar.webp)

#### SchedulerView

![SchedulerView — six themes](docs/assets/components/scheduler-view.webp)

#### WeekCalendar

![WeekCalendar — six themes](docs/assets/components/week-calendar.webp)

### Board

#### BoardCard

![BoardCard — six themes](docs/assets/components/board-card.webp)

#### BoardColumn

![BoardColumn — six themes](docs/assets/components/board-column.webp)

#### BoardToolbar

![BoardToolbar — six themes](docs/assets/components/board-toolbar.webp)

#### LaneBoard

![LaneBoard — six themes](docs/assets/components/lane-board.webp)

#### TaskBoard

![TaskBoard — six themes](docs/assets/components/task-board.webp)

#### TaskDialog

![TaskDialog — six themes](docs/assets/components/task-dialog.webp)

<!-- catalogue:end -->

## Visual regression testing

Beyond the release catalogue above, a two-stage regression harness renders
the whole surface (every family × 3 themes × base/hover/focus states + the
theme banner + the app shell — 77 frames) and compares it against the
previous render:

1. cheap 112-bit fingerprint per frame (gradient hash + color signature);
2. full pixel diff + change bbox **only when the fingerprint disagrees**;
3. only genuinely changed frames reach a vision model for classification.

Frames are deterministic by construction: frozen page clock (calendar seeds
and "today" markers can't drift), mouse reset between shots (no stale
`:hover` inheritance), stubbed remote images, reduced motion, fixed
viewport. Run it before/after any visual change:

```bash
npm run visual:capture   # regenerate the baseline (visual/baseline/)
npm run visual:test      # compare current render vs baseline; exit 1 on changes
npm run visual:update    # promote the last render to baseline (no re-render)
npm run visual:report    # print the last results
```

Changed frames land in `visual/diff/` as magenta overlays (+ cropped
vision-ready copies) with bbox/ratio facts in `visual/results.json`.
Baselines are gitignored and machine-specific. Full design and triage
protocol: `docs/visual-regression.md`.

## Notes

- All components are scoped SFCs on `var(--…)` tokens — they ship with zero own
  CSS beyond token reads, so theming is the single `theme.css` file.
- `src/kit.css` holds the couple of non-scoped helpers the kit needs at runtime:
  the `.board-drag-mirror` clone and the `v-ripple` ripple span.
- See `docs/dependencies.md` for the dependency decision log.

## Origin

Forked from the Nexus app's custom UI kit (`web/src/components/kit|charts|calendar|board`
+ `web/src/design-tokens.css` + `web/src/accent.ts` in the Nexus repo); the Nexus-bound
screens and the app stylesheet were left behind, and `theme.ts` replaces the app's
`shared/types.ts` for the theme/accent contracts.
