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
