# Visual regression harness

Vision-gated visual regression for the kit's render surface: every component
family across themes, interaction states and the app shell is re-rendered and
compared against the previous render.

This harness is separate from the release catalogue images. Family/theming
coverage here is unrelated to the per-component, six-theme catalogue redesign
proposed in `docs/per-component-rendering.md`. The comparison is two-stage and cheap
by design — a full pixel diff only runs when a compact fingerprint disagrees,
and **only genuinely changed frames are handed to a vision model** for
analysis.

```
render (Playwright, frozen clock)
  → 77 frames → PNG
      │
      ▼
fingerprint (112-bit: 64-bit gradient dHash + 48-bit color signature)
      │ equal ────────────────► identical (done, no diff pass)
      ▼ differs
full-res diff → changed-pixel ratio + tight bbox
      │ sparse & < 0.05% ─────► noise (AA/subpixel jitter, still a pass)
      │ dense cluster or ≥ threshold
      ▼
      CHANGED → overlay PNG + cropped 2x artifact → VISION MODEL (triage)
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run visual:capture` | regenerate the baseline (`visual/baseline/`) from the current render |
| `npm run visual:test` | render again, compare vs baseline, write `visual/results.json` + `visual/diff/`; **exit 1 if any frame changed** (CI hook) |
| `npm run visual:update` | promote the last tested render (`visual/current/`) to baseline — no re-render |
| `npm run visual:report` | print the last results without rendering |

Flags: `--only=<shot-id>` (render/compare one frame, keeps the rest of the
baseline), `--allow-changes` (exit 0 despite changes), `VISUAL_DEBUG=1`
(dump per-shot layout facts to `visual/debug-*.json` for triage).

Every run rebuilds the demo (`vite build` → `dist-demo/`) and serves it with
`vite preview`; `npx playwright install chromium` is the only prerequisite.

## The frame matrix (77 shots)

- `family-<id>-<theme>-<state>` — 9 families × 3 themes (light / dark /
  thermal) × 3 states:
  - `base` — the print route (`?print=family&id=…&theme=…`), which renders
    every open overlay/panel state the audit uses;
  - `hover` — pointer over the first *reachable* control (hit-tested with
    `elementFromPoint`, so open scrims/drawers can't block it); skipped
    frames are reported, never failed;
  - `focus` — keyboard focus on the same control (focus ring visible).
- `banner-all-themes` — the 24-theme showcase island.
- `shell-dark-default` — the full playground app shell (sidebar + page).

## Determinism — read before trusting a diff

A frame must be bit-identical across runs and machines or every comparison is
noise. The harness enforces:

1. **Frozen clock** — `page.clock.install()` pins a fixed date in every page:
   calendar seed grids, "today" highlights, terminal timestamps and app
   timers cannot drift. Never remove this "so the calendar shows the real
   today" — the whole point is stable baselines.
2. **Mouse reset before every `goto`** — pointer position persists across
   page loads in one Playwright page object; without `page.mouse.move(0, 0)`
   every render inherits the previous shot's `:hover` state somewhere and
   frames become session-history-dependent (this was a real bug found on the
   first comparison run — do not regress it).
3. **Remote images stubbed** — MediaGallery pulls picsum.photos images;
   `context.route` serves a fixed placeholder so network timing or absence
   cannot change the gallery card.
4. **Reduced motion emulated** (`reducedMotion: "reduce"` — the kit zeroes
   every `--dur-*`), fixed viewport + `deviceScaleFactor: 2`, fonts awaited
   before every shot, 120 ms settle before capture.
5. Baselines are **gitignored** (`visual/baseline|current|diff`) — they are
   machine/browser-build specific by design and regenerate with capture.

## The comparator (`scripts/visual-compare.mjs`)

Pure functions, no browser, unit-tested (`test/visual-compare.test.ts`):

- `dhash(img)` — 112-bit fingerprint. The 64-bit gradient part is blind on
  uniform surfaces (two flat frames of different colours both hash to zero),
  so a 48-bit 4×4 block-mean **color signature** is appended. A full-surface
  recolor can never slip past the cheap gate.
- `diffFrames(a, b)` — one linear pass with per-channel tolerance (default
  4/255), alpha-aware (pixels invisible on both sides never count), tracking
  changed-pixel ratio and the tight bounding box.
- **Verdicts**:
  - `identical` — fingerprint agrees, or the full pass sees zero changed
    pixels (sub-tolerance drift);
  - `noise` — sparse drift below the ratio threshold (default 0.05%);
  - `changed` — ratio ≥ threshold, **or a compact cluster** (`bboxArea /
    changed < 2`) at any ratio: one thin accent bar recoloured is a real
    change even at 0.03 %, and must reach the vision gate.
- `diffOverlay(current, baseline)` — current frame with changed pixels
  painted magenta plus a bbox stroke; the harness also writes a
  **bbox-cropped, 2× upscaled** copy per changed frame
  (`visual/diff/<id>.crop.png`) because vision models misread full-frame
  overlays at catalogue scale.

## The vision gate

The harness never calls a model: it isolates the signal. After `visual:test`,
*only* `changed` frames are listed as the vision input (identical/noise are
never surfaced). Feed the cropped artifact (first) and the full overlay to a
vision model and classify: deliberate change (token/component edit) vs
regression (broken state, shifted layout, missing element). Pixel truths are
the comparator's numbers — treat vision output as triage, not ground truth:
models hallucinate on dense overlays and tiny crops (observed during
development).

## Fixing a real regression

1. Inspect `visual/diff/<id>.png` + `<id>.crop.png` (vision triage) and
   `results.json` (exact bbox/ratio — the bbox localises the change).
2. Fix the component; run `npm run visual:test` again — the changed frame
   should report `identical` and `diff/` stays clean.
3. Intentional visual change (new state, retheme): re-capture the affected
   baseline shots (`npm run visual:capture -- --only=<id>`), review, commit.

## When to update the baseline

After any deliberate visual change (component state, theme token, layout):
`npm run visual:update` (promotes the last test render) or
`visual:capture` (full rebuild). Never update the baseline to silence an
unexplained diff — that is exactly what the harness exists to catch.
