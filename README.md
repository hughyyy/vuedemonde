# vuedemond

A lightweight Vue 3 component + design-token library, extracted from (and built
through) the Nexus visual-editor app's custom UI kit. Every component is a
hand-written SFC that reads CSS custom-property tokens from a single theme
stylesheet — no UI-library dependency, no runtime CSS-in-JS, just Vue.

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
import { AppButton, DataTable, notify, THEME_LABELS } from "vuedemond";
import "vuedemond/theme.css";  // required — the tokens + 13 themes
import "vuedemond/kit.css";    // optional — global helpers (board drag, ripple)

createApp(App).use(FormDirectives).mount("#app"); // optional: v-mask/v-key-filter/v-ripple...
```

The library is ESM (`.js` + `.d.ts`), so consume it through a bundler (Vite, etc.).
`vue` is a peer dependency. `theme.css` and `kit.css` are also bundled into the
single `vuedemond.css` convenience entry if you prefer one import.

## Theming

- One stylesheet drives everything: `:root` = dark by default; each `[data-theme="…"]`
  block redefines the colour tokens. Set `document.documentElement.dataset.theme`
  to switch: `dark`, `light`, `late-night`, `thermal`, `neon-cyberpunk`, `grunge`,
  `granite`, `classic`, `high-contrast`, `bubblegum`, `matrix`, `shining-gold`,
  `pure-platinum`.
- `src/theme.ts` exports `THEME_IDS`, `THEME_LABELS`, `isThemeId`, and the
  `AccentChoice` type for building your own picker.
- User accent: `applyAccent({ kind: "solid", color })` or
  `applyAccent({ kind: "gradient", from, to })` derives `--accent`, `--accent-2`,
  `--accent-gradient`, `--accent-strong`, `--accent-soft`, `--accent-ink` and
  `--focus-ring` and writes them to `:root`; `applyAccent(null)` resets.
- Reduced motion is built in: under `prefers-reduced-motion` all `--dur-*` go to `0ms`.

## The playground

`npm run dev` opens a lightweight interactive catalogue (`playground/`) that
dogfoods the library: every family is a live, editable example with a theme +
accent switcher in the header.

## Component inventory

### Primitives
`AppButton` · `AppIcon` · `AppBadge` · `AppChip` · `AppAvatar` / `AvatarStack` ·
`AppMessage` · `AppProgress` · `Skeleton` · `Divider`

### Inputs & forms
`AppInput` · `AppTextarea` · `AppSelect` · `AppCheckbox` · `AppToggle` ·
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
`DataTable` · `Paginator` · `DataView` · `VirtualScroller` · `Tree` ·
`TreeTable` · `TreeSelect` · `OrderList` · `PickList` · `Timeline` ·
`Terminal` · `TextEditor` · `OrgChart` · `MeterGroup`

### Layout
`AppPanel` · `Card` · `Fieldset` · `Splitter` · `ScrollArea` · `Toolbar` ·
`Fluid` · `Stepper` · `MediaGallery` · `PaneSection`

### Charts (dependency-free inline SVG)
`BarChart` · `LineChart` · `DonutChart` · `RadarChart` · `ChartLegend`

### Calendar
`MonthCalendar` · `WeekCalendar` · `DayCalendar` · `SchedulerView` ·
`CalendarToolbar` · `EventChip` / `EventTile` / `EventDialog`

### Board (kanban, pointer drag & drop)
`TaskBoard` · `LaneBoard` — both share one drag engine; mount one at a time on
any route (their drop handlers are a module singleton).

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
