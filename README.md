# Vue de monde

A lightweight Vue 3 component + design-token library, extracted from (and built
through) the Nexus visual-editor app's custom UI kit. Every component is a
hand-written SFC that reads CSS custom-property tokens from a single theme
stylesheet — no UI-library dependency, no runtime CSS-in-JS, just Vue.

Published as the npm package **`vuedemonde`**.

<p align="center">
  <img src="docs/assets/theme-banner.png" width="100%" alt="All 16 themes: two rows of 8 theme cards — dark themes first, light themes grouped together" />
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
import "vuedemonde/theme.css";  // required — the tokens + 16 themes
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
  `granite`, `classic`, `high-contrast`, `bubblegum`, `matrix`, `shining-gold`,
  `pure-platinum`, `mint`, `sunshine`, `monotone`.
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
  `mint`, `sunshine`, `monotone`; `dark` otherwise) so native controls,
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
(theme list + the "16 themes" counts + banner regeneration). Contrast is
reported against the shipped themes' own envelope — informational, never
blocking. See `docs/theme-builder.md` for the token model and the derivation
proportions.

## The playground

`npm run dev` also opens the lightweight interactive catalogue (`playground/`)
that dogfoods the library: every family is a live, editable example with a theme
and accent switcher in the header. The theme builder is the same dev server at
`/?build`.

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

Every family below is shown in the three catalogue themes — light, dark (the
default), and thermal. Regenerate whenever a component or theme changes:
`npm run render:release` (see `docs/release-rendering.md`).

| Family | light | dark | thermal |
| --- | --- | --- | --- |
| Primitives | ![](docs/assets/catalogue-primitives-light.png) | ![](docs/assets/catalogue-primitives-dark.png) | ![](docs/assets/catalogue-primitives-thermal.png) |
| Inputs & Forms | ![](docs/assets/catalogue-inputs-light.png) | ![](docs/assets/catalogue-inputs-dark.png) | ![](docs/assets/catalogue-inputs-thermal.png) |
| Overlays & Feedback | ![](docs/assets/catalogue-overlays-light.png) | ![](docs/assets/catalogue-overlays-dark.png) | ![](docs/assets/catalogue-overlays-thermal.png) |
| Navigation | ![](docs/assets/catalogue-navigation-light.png) | ![](docs/assets/catalogue-navigation-dark.png) | ![](docs/assets/catalogue-navigation-thermal.png) |
| Data Display | ![](docs/assets/catalogue-data-light.png) | ![](docs/assets/catalogue-data-dark.png) | ![](docs/assets/catalogue-data-thermal.png) |
| Layout | ![](docs/assets/catalogue-layout-light.png) | ![](docs/assets/catalogue-layout-dark.png) | ![](docs/assets/catalogue-layout-thermal.png) |
| Charts | ![](docs/assets/catalogue-charts-light.png) | ![](docs/assets/catalogue-charts-dark.png) | ![](docs/assets/catalogue-charts-thermal.png) |
| Calendar | ![](docs/assets/catalogue-calendar-light.png) | ![](docs/assets/catalogue-calendar-dark.png) | ![](docs/assets/catalogue-calendar-thermal.png) |
| Board | ![](docs/assets/catalogue-board-light.png) | ![](docs/assets/catalogue-board-dark.png) | ![](docs/assets/catalogue-board-thermal.png) |

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
