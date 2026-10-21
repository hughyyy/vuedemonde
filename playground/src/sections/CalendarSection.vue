<script setup lang="ts">
import { ref } from "vue";
import {
  CalendarToolbar, DayCalendar, EventChip, EventTile, MonthCalendar,
  SchedulerView, WeekCalendar,
  type CalendarEvent, type CalendarViewId, ev, seedEvents,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

defineProps<{ print?: boolean }>();

/* Interactive toolbar demo state — prev/today/next + view switch. */
const anchor = ref(new Date());
const view = ref<CalendarViewId>("traditional");

/* Static per-type cards: one of each calendar type mounts at once so every
 * view state is visible. Seeds are intentionally deterministic — untouched. */
const calAnchor = ref(new Date());
const events = ref<CalendarEvent[]>(seedEvents(new Date()));

/* Static tint gallery — one event per tint so all six hues render at once. */
const tintEvents: CalendarEvent[] = [
  ev("ind", "Review", new Date(2026, 0, 5, 10, 0), new Date(2026, 0, 5, 10, 30), "indigo"),
  ev("sky", "Stand-up", new Date(2026, 0, 5, 10, 0), new Date(2026, 0, 5, 10, 30), "sky"),
  ev("eme", "Release", new Date(2026, 0, 5, 10, 0), new Date(2026, 0, 5, 10, 30), "emerald"),
  ev("amb", "Retro", new Date(2026, 0, 5, 10, 0), new Date(2026, 0, 5, 10, 30), "amber"),
  ev("org", "Ops", new Date(2026, 0, 5, 10, 0), new Date(2026, 0, 5, 10, 30), "orange"),
  ev("ros", "Incident", new Date(2026, 0, 5, 10, 0), new Date(2026, 0, 5, 10, 30), "rose"),
];

function step(dir: 1 | -1): void {
  const a = new Date(anchor.value);
  if (view.value === "traditional") a.setMonth(a.getMonth() + dir);
  else if (view.value === "scheduler") a.setDate(a.getDate() + 7 * dir);
  else a.setDate(a.getDate() + dir);
  anchor.value = a;
}

function reset(): void {
  anchor.value = new Date();
}
</script>

<template>
  <div class="wrap">
    <h2 class="sec-title">Calendar</h2>

    <DemoCard class="demo span-2" title="MonthCalendar" desc="Traditional month grid — six weeks of day cells with stacked events (+N more).">
      <MonthCalendar :anchor="calAnchor" :events="events" />
    </DemoCard>

    <DemoCard class="demo span-2" title="WeekCalendar" desc="Scheduler week grid — hour axis, overlap lanes, all-day strip, current-time line.">
      <WeekCalendar :anchor="calAnchor" :events="events" />
    </DemoCard>

    <DemoCard class="demo span-2" title="DayCalendar" desc="Granular day timeline with half-hour rows, lanes and an all-day strip.">
      <DayCalendar :anchor="calAnchor" :events="events" />
    </DemoCard>

    <DemoCard title="CalendarToolbar" desc="View switch + prev / today / next — wired to its own local state.">
      <CalendarToolbar :title="anchor.toDateString()" :view="view" @prev="step(-1)" @next="step(1)" @today="reset" @update:view="view = $event" />
    </DemoCard>

    <DemoCard title="EventTile / EventChip" desc="All six tints — filled tiles, block chips and inline cell chips.">
      <div class="row tiles">
        <div v-for="e in tintEvents" :key="e.id" class="tile-slot">
          <EventTile :event="e" />
        </div>
      </div>
      <div class="row chips">
        <EventChip v-for="e in tintEvents" :key="e.id" :event="e" layout="block" class="chip-block" />
      </div>
      <div class="row">
        <EventChip v-for="e in tintEvents" :key="e.id" :event="e" />
      </div>
    </DemoCard>

    <DemoCard class="demo span-3" title="SchedulerView" desc="Full wired surface — own state, toolbar and event dialog.">
      <SchedulerView />
    </DemoCard>
  </div>
</template>

<style scoped>
.wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 14px;
  align-items: start;
}
.wrap > .sec-title {
  grid-column: 1 / -1;
}
.span-2 { grid-column: span 2; }
.span-3 { grid-column: 1 / -1; }
.sec-title {
  margin: 0 0 16px;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.tiles {
  align-items: stretch;
  margin-top: 0;
}
.tile-slot {
  position: relative;
  flex: 1 1 30%;
  min-width: 140px;
  height: 40px;
}
.chip-block {
  flex: 1 1 30%;
  min-width: 90px;
}
</style>
