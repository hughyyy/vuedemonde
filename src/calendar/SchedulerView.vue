<script setup lang="ts">
import { ref } from "vue";
import type { CalendarEvent } from "./model";
import { seedEvents } from "./model";
import { useCalendarState } from "./useCalendarState";
import CalendarToolbar from "./CalendarToolbar.vue";
import MonthCalendar from "./MonthCalendar.vue";
import WeekCalendar from "./WeekCalendar.vue";
import DayCalendar from "./DayCalendar.vue";
import EventDialog from "./EventDialog.vue";

/**
 * SchedulerView — wires the shared toolbar + state to whichever of the three
 * calendar types is active (Traditional / Scheduler / Granular) and owns the
 * event store + detail dialog.
 */
const { anchor, view, title, prev, next, today, setView } = useCalendarState();
const events = ref<CalendarEvent[]>(seedEvents());

const selected = ref<CalendarEvent | null>(null);
const dialogOpen = ref(false);

function openEvent(e: CalendarEvent): void {
  selected.value = e;
  dialogOpen.value = true;
}

function closeEvent(): void {
  dialogOpen.value = false;
  selected.value = null;
}

function applyPatch(patch: Partial<CalendarEvent>): void {
  if (selected.value) Object.assign(selected.value, patch);
}
</script>

<template>
  <div class="scheduler">
    <CalendarToolbar
      :title="title"
      :view="view"
      @prev="prev()"
      @next="next()"
      @today="today()"
      @update:view="setView($event)"
    />
    <div class="scheduler__body">
      <MonthCalendar
        v-if="view === 'traditional'"
        :anchor="anchor"
        :events="events"
        @open="openEvent"
      />
      <WeekCalendar
        v-else-if="view === 'scheduler'"
        :anchor="anchor"
        :events="events"
        @open="openEvent"
      />
      <DayCalendar
        v-else
        :anchor="anchor"
        :events="events"
        @open="openEvent"
      />
    </div>
    <EventDialog :event="selected" :open="dialogOpen" @close="closeEvent" @update="applyPatch" />
  </div>
</template>

<style scoped>
.scheduler {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 100%;
  min-height: 0;
}
.scheduler__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
