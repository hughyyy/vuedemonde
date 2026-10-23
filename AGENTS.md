# AGENTS.md — vuedemonde

Vue 3 component + design-token library (kit, charts, calendar, board) with a
dogfooding playground. Read this first; follow it like code.

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | vitest unit + component suites (`test/*.test.ts`, happy-dom) |
| `npm run typecheck` | vue-tsc over src/playground/test — must be clean on every change |
| `npm run build` / `build:types` | library build (dist/) |
| `npm run dev` | playground + theme builder (`/?build`) |
| `npm run test:audit` | render-audit harness: mounts all families under 3 themes + banner under 16; fails on ANY console error |
| `npm run render:release` | README catalogue PNGs (docs/assets/) — after visual changes |
| `npm run visual:capture / visual:test / visual:update / visual:report` | visual regression harness — see below |

Full suite + typecheck before yielding. Do not run project-wide suites in
subagents mid-flight (they block each other).

## Test conventions (match existing files)

- Header: `// @vitest-environment happy-dom`; import components via relative
  paths (`../src/kit/X.vue`), types via `import type`.
- Mount with `global: { stubs: { teleport: true } }` for Teleport components;
  focus assertions need `attachTo: document.body` (happy-dom only tracks
  `activeElement` for connected nodes).
- Quirks: test-utils `trigger("keydown.arrow-right")` sends the LOWERCASE key
  `"arrow-right"` — dispatch `new KeyboardEvent("keydown", { key: "ArrowRight" })`
  manually for handlers comparing e.key case-sensitively. Module singletons
  (`toasts`, `confirmState`, `dialogs`, board drag state) leak across tests —
  reset in beforeEach.
- Assert observable contracts (props/emits/DOM), not implementation. Cover
  edge cases: empty/disabled/bounds/boundaries. Document intentionally-quirky
  behavior with a `(documented: …)` comment instead of "fixing" it.
- New logic modules get edge-case unit tests; new components get behavior
  tests. Pure .mjs helpers used by tests need a `.d.mts` declaration next to
  them.

## Coding rules (enforced)

- No one-line wrapper functions (`const getX = (v) => v.x`) unless a durable
  contract; `import type` at top level; static string-keyed tables are
  `Record`, never Map; no `ReturnType<typeof fn>`-typed locals — export the
  type; no TS syntax inside `.mjs` harness files.
- Fix the source, never suppress the symptom; clean cutover — migrate every
  caller, delete obsolete paths.

## Quality process (repo convention — non-negotiable)

- Every component/behavior fix lands with: its own commit, a `CHANGELOG.md`
  entry, and a `docs/quality-audit.md` register row flip where applicable.
- `docs/quality-audit.md` is the living issue register — read the open rows
  before touching a component; check it for the component when fixing.

## Visual regression harness

`scripts/visual-regression.mjs` renders 77 deterministic frames (9 families ×
3 themes × base/hover/focus + banner + shell) and two-stage-compares them;
only `changed` frames reach a vision model (see `docs/visual-regression.md`).

Invariants — never "simplify" them away:
1. Frozen page clock (`page.clock.install`) — calendar seeds/"today"/timers
   must not drift between runs.
2. `page.mouse.move(0, 0)` before every `goto` — pointer position persists
   across loads; without the reset every frame inherits the previous shot's
   `:hover` (session-history-dependent renders — a real bug already fixed).
3. Remote images stubbed via `context.route` (picsum) — network timing must
   not enter the comparison.
4. `reducedMotion: "reduce"`, fixed viewport + deviceScaleFactor 2, fonts
   awaited, 120 ms settle. Element screenshots only (`#print-section`,
   `#banner`), full element captures so open print-mode overlays are in-frame.

Baselines (`visual/baseline|current|diff`) are gitignored and machine-specific:
regenerate with `visual:capture`. Never update a baseline to silence an
unexplained diff.

## Structure

- `src/kit/` — the component library (+ `icons.ts`, `toasts.ts`,
  `confirm.ts`, `dialogs.ts`, `useModalTrap.ts`, `directives.ts`,
  `terminal/`). Barrel: `src/kit/index.ts`.
- `src/charts/` (pure SVG + `geometry.ts`/`shared.ts` math), `src/calendar/`
  (`model.ts` date math, `placement.ts` grid math, `useCalendarState.ts`,
  views), `src/board/` (`model.ts` seeds, `useDragDrop.ts` module-singleton
  drag engine, views).
- `src/accent.ts` / `src/theme.ts` — accent derivation + theme registry.
- `playground/` — catalogue sections (`sections/*.vue`), print routes
  (`?print=family&id=&theme=`, `?print=component&id=&theme=`, `?print=banner`),
  theme builder (`/?build`); also builds to a static site (`npm run build:demo`
  → `dist-demo/`) — hosting plan in `docs/github-pages.md` (not deployed).
  Per-component demos live in `playground/src/catalogue/*.demo.vue`, registered
  by `scripts/catalogue-registry.mjs`; see `docs/per-component-rendering.md`.
- `audit/` + `vitest.audit.config.ts` — console-error render harness.
- `scripts/` — `render-release.mjs` (banner + per-component catalogue),
  `catalogue-registry.mjs` (regenerates `playground/src/catalogue/index.ts`),
  `catalogue-readme.mjs` (README tables), `visual-regression.mjs` +
  `visual-compare.mjs` (visual harness), `setup-npm-token.sh`.
