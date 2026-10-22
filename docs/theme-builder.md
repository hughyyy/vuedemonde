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

A theme block in `src/theme.css` declares exactly **34 tokens** plus one
`color-scheme` declaration:

| Group | Tokens |
| --- | --- |
| Surfaces | `bg`, `surface-1`, `surface-2`, `surface-3`, `canvas-bg`, `overlay` |
| Text | `text`, `text-2`, `text-3`, `text-disabled` |
| Lines | `line`, `line-strong`, `divider` |
| Accent | `accent`, `accent-2`, `accent-gradient`, `accent-strong`, `accent-soft`, `accent-ink` |
| Status | `ok`/`warn`/`err`/`run`/`info` (+ `-soft`), `link`, `reasoning` |
| Elevation | `shadow-raised`, `shadow-overlay`, `shadow-modal` |

`color-scheme` follows the palette: `light` for `light`, `pure-platinum`, `mint`,
`sunshine`, `monotone`, `dark` for everything else. It is what makes native
controls, scrollbars and form widgets match the theme; the emitter writes it on
every generated block, and the round-trip test asserts it matches the shipped
one.

Structural tokens (type, space, radius, motion, `--focus-ring`, the legacy
aliases) live only on `:root` and are never per-theme.

### What each surface token actually paints

This matters when picking colours — the six surface tokens are not
interchangeable. Occurrences across `src/kit`, `src/charts`, `src/calendar`,
`src/board`:

| Token | Uses | Paints |
| --- | --- | --- |
| `--bg` | 2 | the page behind the app shell |
| `--surface-1` | 71 | cards, panels, sidebars, menus, dialogs |
| `--surface-2` | 53 | raised rows, table headers, status bars |
| `--surface-3` | 27 | hover / pressed rows |
| `--canvas-bg` | 1 | the work area a canvas sits on (`TextEditor` code blocks) |
| `--overlay` | 4 | modal + drawer scrims |

So `--canvas-bg` is *not* the page background: it is the surface the app's
content area uses, and only code blocks consume it directly. The preview models
that relationship — see [Preview](#preview).

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

The pane is a miniature app shell, not a swatch board, because the token
relationships only make sense nested:

```
--bg            page + shell frame
└─ --surface-1  top bar, sidebar
   └─ --canvas-bg  work area (headline, cards sit ON this, status bar)
      ├─ --surface-1  cards (AppPanel), nested AppBadge/AppMessage tints
      ├─ --surface-2  status bar, table headers
      └─ --canvas-bg  code blocks (TextEditor's <pre>)
--overlay       scrim clipped over the work area, behind a --surface-1 dialog
```

Seven cards cover the type ladder, surfaces (1/2/3 over the canvas), actions,
status tints, form controls, elevation + modal, and rich text. `--link` and
`--reasoning` are drawn explicitly because **no kit component consumes them** —
the card says so, so their swatches aren't mistaken for dead controls.

The draft is applied as inline custom properties on the preview subtree, not on
`documentElement`: the builder chrome keeps the shipped theme, so a draft with
unreadable contrast can never make its own controls unusable, and nothing leaks
after unmount. Teleported overlays (dialog/drawer/toast) are therefore
represented by a clipped scrim + panel specimen rather than the real teleport;
they resolve the same tokens.

### Editing rules

- Anchor swatches and hex fields accept any `#rgb`/`#rrggbb`; invalid text
  reverts to the committed value instead of reaching the emitted CSS.
- Picking a colour for `overlay` or a `*-soft` token **keeps that token's
  alpha** — the picker returns `#rrggbb`, and writing it verbatim would turn a
  14 % tint into a solid fill.
- Shadows are whole CSS values, so they edit as text (no colour picker).
- `--accent-gradient` is never editable: it must stay
  `linear-gradient(var(--accent), var(--accent-2))` so a runtime
  `applyAccent()` override keeps flowing through it.
- The id is normalised to `[a-z0-9-]`; an empty id or one that collides with a
  shipped theme is reported under the field (it would emit a selector that
  matches nothing, or shadow a shipped theme).
- Derived tokens are hidden until unlocked, or revealed with "Show all 20".

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
- text ladder — warn when `text-2` → `text-3` → `text-disabled` don't lose
  contrast in that order
- mode vs background — warn when the declared `mode` disagrees with the
  polarity of `bg` (the ladders and shadows are derived for the wrong polarity)

## Shareable state

The draft is stored in `localStorage` under `vuedemonde-builder`, and a link adds
`?build#spec=<base64url>`. A link wins over localStorage; once a link has been
shared, the hash tracks later edits (`history.replaceState`) so a reload never
restores an older draft.

The hash is user-controlled, so decoding is defensive: every anchor must be
present and a valid colour, unknown override keys are dropped, and a missing
knob falls back to its default. A malformed link yields "no shared theme" rather
than a half-built spec.

