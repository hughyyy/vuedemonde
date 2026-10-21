# Quality audit register (0.2.1 phase)

Living register for the quality focus phase: every issue found during the
component audit is recorded here with its required work. **Each fix lands with
its own commit and a CHANGELOG entry; the register row flips to `fixed` in the
same commit.** Anything not yet audited is implicitly `open` on first sight.

## Process

1. Run the repeatable net: `npm run test:audit` (mounts every family section
   under dark/light/thermal + the banner under all 16 themes; fails on ANY
   console error/warning). This suite is the regression harness for the phase —
   opt-in by design, so it runs on demand, not on every change.
2. Visual pass per component: catalogue renders (`npm run render:release`) +
   reading the SFC for a11y (focus, keyboard, aria), edge states
   (empty/disabled/loading/long content) and prop/emit consistency.
3. Record findings below; fix with a dedicated commit; update changelog.

## Register

| Component | Severity | Observed | Required work | Status |
| --- | --- | --- | --- | --- |
| InputOtp | med | six identical aria-labels — digits indistinguishable; no group label | per-digit labels + labelled group | fixed |
| InputTags | med | input unnamed once tags exist (placeholder cleared) | ariaLabel prop | fixed |
| InputPassword | med | password field unnamed; reveal toggle lacked pressed state | ariaLabel + aria-pressed | fixed |
| InputColor | low | current button named only by title; hidden native input focusable | aria-label; tabindex=-1 + aria-hidden | fixed |
| Listbox | med | click-only listbox — no keyboard path | APG-style arrows/Home/End/Enter + aria-activedescendant | fixed |
| FileUpload | med | drop zone mouse-only; hidden native input in tab order | keyboard zone (role/tabindex/keys); inert input | fixed |
| AutoComplete | med | unnamed combobox, click-only suggestions | combobox role + aria-expanded/controls/activedescendant + arrow keys | fixed |
| DatePicker / CascadeSelect | low | trigger showed haspopup but never announced open state | aria-expanded wiring | fixed |
| FloatLabel / IftaLabel | med | label and input never associated | for/id wiring on mount | fixed |
| Slider / Knob | low | degenerate min===max range rendered NaN% fill/arc | guard division by zero | fixed |
| Compare | med | draggable-only divider — no keyboard path, no focusable handle | tabindex + arrow keys + aria-label + focus ring | fixed |
| AppInput / AppTextarea / AppSelect | med | hint/error text not associated with the control (aria-describedby missing); aria-invalid="false" rendered when clean; no token focus ring | wire useId-describedby, omit aria-invalid when valid, focus-visible ring | fixed |
| AppRadio | high | hardcoded name="kit-radio" — two groups on one page collide and cancel each other's selection | per-instance useId group name + test | fixed |
| PaneSection | med | collapse toggle lacked aria-controls and a focus ring | wire useId + aria-controls; focus-visible ring | fixed |
| AppProgress | low | aria-valuenow unclamped (announced value can disagree with the bar); indeterminate motion ignored reduced-motion contract | clamp like the width; stop animation under reduced motion | fixed |
| AppMessage | med | all kinds announced as role=status; close button lacked a focus ring | role=alert for err; focus-visible ring | fixed |
| AppChip | low | removable close button lacked a focus ring | focus-visible ring | fixed |
| Skeleton | med | text-line mode not hidden from assistive tech | aria-hidden on text mode | fixed |
| AppButton | med | no accessible name for icon-only buttons; no aria-busy while loading; no focus-visible ring; spinner ignores reduced motion | add ariaLabel prop + aria-busy + focus-visible + static spinner under reduced motion, with a11y tests | fixed |
| InputsSection (catalogue) | med | `<Knob>` used without import — the component silently never rendered in the catalogue; caught by the first `test:audit` run | import Knob from `@vuedemond` in the section | fixed |
| Calendar EventTile / EventChip | low | long titles clip at container edge without ellipsis (catalogue check) | verify component markup; add `text-overflow: ellipsis` / line-clamp with `title` attr | open |
| WeekCalendar / DayCalendar | low | time-axis labels not vertically centred on their grid lines; day view has inert whitespace when events are sparse | nudge tick text offset; (whitespace is inherent to a time grid — document, don't fight) | open |
| AppTabs | low | disabled tab lacks a visually distinct state (catalogue check) | confirm `.is-disabled` styling exists; strengthen if indistinguishable | open |
| VirtualScroller | info | no prop to control scroll position; catalogue cannot show a tail state | expose `scrollTo`/`scrollTop` prop (enhancement, not a defect) | open |
| DataTable | info | no expandable in-place detail rows (mocks logs console built its own table for this) | `expandable` mode + detail slot (enhancement) | open |
| AppTooltip | info | hover/focus-only — no static representation possible in renders (documented) | none — documented limitation | open |
| _Populated by the audit run — see commits_ | | | | |

Severity: `crit` breaks rendering, `high` broken state/behavior, `med`
a11y/edge-state gap, `low` polish, `info` enhancement/documented limitation.
