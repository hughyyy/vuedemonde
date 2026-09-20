import { computed, ref } from "vue";
import { addDays, addMonths, fmtDayTitle, fmtMonthTitle, fmtWeekTitle, startOfDay } from "./model";

/**
 * Shared calendar navigation state: the active view (Traditional / Scheduler /
 * Granular), the anchor date, and per-view prev/next/today stepping.
 */

export type CalendarViewId = "traditional" | "scheduler" | "granular";

export const CALENDAR_VIEWS: { id: CalendarViewId; label: string }[] = [
  { id: "traditional", label: "Traditional" },
  { id: "scheduler", label: "Scheduler" },
  { id: "granular", label: "Granular" },
];

export function useCalendarState(initial = new Date()) {
  const anchor = ref(startOfDay(initial));
  const view = ref<CalendarViewId>("traditional");

  const title = computed(() =>
    view.value === "traditional"
      ? fmtMonthTitle(anchor.value)
      : view.value === "scheduler"
        ? fmtWeekTitle(anchor.value)
        : fmtDayTitle(anchor.value),
  );

  function step(dir: 1 | -1): void {
    const a = anchor.value;
    if (view.value === "traditional") anchor.value = addMonths(a, dir);
    else if (view.value === "scheduler") anchor.value = addDays(a, 7 * dir);
    else anchor.value = addDays(a, dir);
  }

  function today(): void {
    anchor.value = startOfDay(new Date());
  }

  function setView(v: CalendarViewId): void {
    view.value = v;
  }

  return { anchor, view, title, prev: () => step(-1), next: () => step(1), today, setView };
}
