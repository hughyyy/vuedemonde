# Changelog

All notable changes to vuedemonde are recorded here, per the quality-work
convention: **every component fix lands with its own commit, a changelog
entry, and an update to `docs/quality-audit.md`**.

## 0.2.1 — quality focus phase (unreleased)

Beginning of the QA pass over the full component inventory: every component is
audited for rendering errors, accessibility and edge states. Fixes commit
individually; regression coverage lives in the opt-in render-audit suite
(`npm run test:audit`) — it mounts every family section and every theme and
fails on any console error/warning. It is not part of the default `npm test`,
so it runs on demand rather than on every change.

### Added
- Render-audit suite (`audit/`, `vitest.audit.config.ts`): mounts all nine
  family sections (print mode) under dark/light/thermal + the theme banner
  under all 16 themes; asserts zero console errors/warnings.
- `docs/quality-audit.md` — the living issue register for the phase.

### Fixed
- Slider: degenerate min===max range no longer renders NaN fill.
- Knob: same degenerate-range guard on the arc.
- Compare: divider is keyboard-operable (focusable, arrow keys, focus ring) — parity with Splitter.
- AppInput: hint/error text wired to the control via aria-describedby; aria-invalid omitted when clean; token focus-visible ring.
- AppTextarea: same describedby/aria-invalid/focus-ring contract as AppInput.
- AppSelect: same describedby/aria-invalid/focus-ring contract.
- AppRadio: per-instance radio group name (useId) — multiple groups no longer cancel each other's selection.
- PaneSection: toggle wired with aria-controls (useId) and a focus ring.
- AppProgress: aria-valuenow clamped to 0–100 like the bar; indeterminate/spinner animation stops under reduced motion.
- AppMessage: errors announce as role=alert (others stay status); close button gets a focus ring.
- AppChip: removable close button gets a focus ring.
- Skeleton: text-line mode hidden from assistive tech (aria-hidden).
- AppButton: aria-label/aria-busy for icon-only and loading states, focus-visible ring, spinner stops under reduced motion.
- InputsSection (playground): the Knob demo referenced the component without
  importing it, so it silently never rendered in the catalogue — caught by the
  first audit run.

_Populated per component as the audit proceeds._
