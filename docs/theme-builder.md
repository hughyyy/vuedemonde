# Theme builder

The builder lives in the playground: `npm run dev` → **`/?build`**. It authors a
theme as **13 anchors plus two knobs**, derives the remaining tokens, previews
the draft on the real kit, and exports a stylesheet block in one of three forms.

Source:

- `playground/src/builder/theme-spec.ts` — pure model: parse, derive, emit,
  validate, share-state codec. No DOM, no Vue; unit-tested in
  `test/theme-builder.test.ts`.
- `playground/src/builder/ThemeBuilder.vue` — the page.
- `playground/src/builder/BuilderPreview.vue` — the preview pane.

## The token contract

A theme block in `src/theme.css` declares exactly **34 tokens**:

| Group | Tokens |
| --- | --- |
| Surfaces | `bg`, `surface-1`, `surface-2`, `surface-3`, `canvas-bg`, `overlay` |
| Text | `text`, `text-2`, `text-3`, `text-disabled` |
| Lines | `line`, `line-strong`, `divider` |
| Accent | `accent`, `accent-2`, `accent-gradient`, `accent-strong`, `accent-soft`, `accent-ink` |
| Status | `ok`/`warn`/`err`/`run`/`info` (+ `-soft`), `link`, `reasoning` |
| Elevation | `shadow-raised`, `shadow-overlay`, `shadow-modal` |

Structural tokens (type, space, radius, motion, `--focus-ring`, the legacy
aliases) live only on `:root` and are never per-theme.

## Anchors and derivation

Authored (13): `bg`, `surface-1`, `canvas-bg`, `text`, `accent`, `accent-2`,
`ok`, `warn`, `err`, `run`, `info`, `link`, `reasoning`.

Derived (21), with proportions fitted from the 16 shipped blocks (mix factors
are along the `bg → text` axis; light themes raise `surface-1` above `bg` and
then step down):

| Token | Dark | Light |
| --- | --- | --- |
| `surface-2` / `surface-3` | 0.084 / 0.127 | 0.043 / 0.091 |
| `text-2` / `text-3` / `text-disabled` | 0.78 / 0.55 / 0.34 | 0.783 / 0.635 / 0.397 |
| `line` / `line-strong` / `divider` | 0.15 / 0.22 / 0.10 | 0.155 / 0.247 / 0.078 |
| `overlay` | bg→black 0.75 @ 0.55 | bg→black 0.90 @ 0.40 |
| `accent-strong` | accent→white 0.18 | accent→black 0.20 |
| `*-soft` | `rgba(base, softAlpha)` | same |
| shadows | tint `#000` | tint `bg→black 0.90` |

`--accent-gradient` is always `linear-gradient(var(--accent), var(--accent-2))`,
and `--accent-ink` picks the derived dark tint of the accent when it clears
4.5:1, else white.

Two knobs: `softAlpha` (0.08–0.24, default 0.14) and `shadowStrength`
(0.4–1.6, default 1).

Anything derived can be unlocked and pinned. Importing a shipped theme pins
every token whose hand-authored value differs from the derivation, so
**parse → derive → emit → parse is lossless** for all 16 blocks — that
round-trip is the test.

## Export modes

| Mode | Selector | Where it goes |
| --- | --- | --- |
| Selectable | `[data-theme="<id>"]` | `src/theme.css`, plus `THEME_IDS`/`THEME_LABELS` in `src/theme.ts` |
| Fixed | `:root` | its own file, imported **after** `vuedemonde/theme.css`; wins over every `[data-theme]` block |
| Default | `:root:not([data-theme])` | its own file; applies while nothing selects a theme |

`:root` and `[data-theme="…"]` have equal specificity, so source order decides —
hence "import after `theme.css`". The fixed block must not be pasted into
`theme.css`: it would become the default for every consumer of the package.

A selectable theme also needs the docs counts updated (README theme list and the
"16 themes" mentions in `README.md`, `docs/release-rendering.md`,
`docs/quality-audit.md`), the id placed in `BannerPrint.vue`'s curated rows,
and the banner re-rendered. The id list in `test/theme-icons.test.ts` is parsed
from `theme.css`, so that file needs no edit — the export pane emits the
checklist.

## Preview

The draft is applied as inline custom properties on the preview subtree, not on
`documentElement`: the builder chrome keeps the shipped theme, so a draft with
unreadable contrast can never make its own controls unusable, and nothing leaks
after unmount. Teleported overlays (dialog/drawer/toast) are therefore not
previewed; the palette they would use is the same one shown in the pane.

## Validation

Reported, never blocking. Thresholds sit inside the shipped envelope, whose own
worst cases are `text-3` 3.27, `link` 3.06, `accent` 2.42, `accent-ink` 2.60 and
status-on-own-tint 2.36 — so a generated theme is only flagged as an error when
it is worse than the library already is:

- `text`/`bg` — warn < 7, error < 4.5
- `text-2`/`bg` — warn < 4.5, error < 3.5
- `text-3`/`bg` — warn < 3, error < 2.4
- `link`/`bg` — warn < 3.5, error < 2.4
- `accent`/`bg` — warn < 3, error < 2.4
- `accent-ink`/`accent` — warn < 4.5, error < 2.4
- status on its own tint — warn < 3, error < 2.2
- surface ladder — error when any consecutive step is below 1.02:1

## Shareable state

The draft is stored in `localStorage` and can be shared as
`?build#spec=<base64url>`. A link wins over localStorage, so a shared theme
always reproduces.
