# Handover — coverage + visual-regression phase (2026-10-23)

State at handoff: branch `main`, 9 commits ahead of `origin/main`, working
tree clean. Full suite: **75 test files / 606 tests passing**, typecheck
clean, `test:audit` 44/44, visual harness deterministic (77/77 identical on
a clean tree).

## What landed this phase

Three interleaved passes over the kit:

1. **Edge-case unit coverage** (rounds 1–2, commits `36a141f`…`74caf34`) —
   every pure logic module (calendar model/placement/state, board
   model/drag-drop, toasts/confirm/dialogs, modal trap, form directives,
   terminal ANSI, chart geometry, accent) and 30+ previously untested
   interactive components (calendar views, board views, overlays/menus,
   pickers/transfers, paginator/rating/input-number/toggle/tabs/tree/…,
   donut/radar charts, icon registry). +218 tests, 57 → 75 files.
2. **10 real defects found by those tests and fixed** (each with a CHANGELOG
   entry): ANSI run-style snapshots (in-place SGR resets corrupted earlier
   runs), v-mask slot advancement, Tree/TreeTable first-expand no-op,
   non-selectable/disabled tree selection gates, TreeSelect missing
   `selectable`, TreeRow click gate, CascadeSelect v-model sync,
   MonthCalendar one-way expand. **Caveat:** the TreeItem/TreeSelect/TreeRow/
   CascadeSelect fixes landed via parallel subagents — their changelog
   entries and audit-register rows were added centrally, but spot-check the
   register if you touch those components.
3. **Vision-gated visual regression harness** (commit `975c383`) — full
   design in `docs/visual-regression.md`; invariants in `AGENTS.md`.

## Open items worth the next session

From `docs/quality-audit.md` (register):
- ContextMenu — ARIA menu pattern (menuitem roles/arrow nav) candidate.
- VirtualScroller — `scrollTo`/`scrollTop` prop.
- DataTable — expandable detail rows.
- AppTabs — verify disabled-tab visual distinction.
- LaneBoard — seed-card polish (optional).

Flagged during edge-case analysis, intentionally left as documented behavior:
- `addMonths` (calendar/model.ts) overflows short months: Jan 31 + 1 month →
  Mar 3. `useCalendarState` month stepping inherits it.
- `placeDay` tiles starting after grid day-end render past the grid bottom;
  end-times aren't height-clamped to the remaining grid span.
- `fmtWeekTitle` month-prefix asymmetry (month on the second bound for
  same-month weeks, first bound for cross-month).
- `keyFilter` blocks a lone `-` keystroke (single-char regex vs the full
  `-?[0-9]` int pattern).
- EventTile meta line: all-day events without a location render no meta.

## Visual harness notes

- 77-frame matrix, two-stage gate (112-bit fingerprint → diff only on
  mismatch), vision triage only for `changed` frames (crop artifacts
  included). Baselines are gitignored — regenerate via `visual:capture`
  after any intentional visual change.
- Determinism invariants (frozen clock, mouse reset, image stubs, reduced
  motion) are load-bearing — the first comparison runs caught real
  session-history drift caused by their absence. See AGENTS.md.
- Known limits: borderline frames can flip between `noise`/`changed` across
  runs at the ratio threshold (clean-tree runs are always 0 changed);
  vision models hallucinate on full-frame overlays and tiny crops — crops
  are the review artifact, comparator numbers are ground truth.

## How to continue

1. `npm run visual:capture && npm run visual:test` to re-establish and prove
   the baseline on a new machine (Playwright chromium required).
2. Pick open register items; each fix: dedicated commit + CHANGELOG entry +
   register row flip + `visual:test` clean.
3. Re-run `render:release` after any visual change to refresh README
   catalogue PNGs.
