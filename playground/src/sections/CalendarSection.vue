<script setup lang="ts">
import { ref } from "vue";
import {
  CalendarToolbar, DayCalendar, MonthCalendar, SchedulerView, WeekCalendar,
  type CalendarEvent, type CalendarViewId, seedEvents,
} from "@vuedemond";

const anchor = ref(new Date());
const view = ref<CalendarViewId>("traditional");
const events = ref<CalendarEvent[]>(seedEvents(new Date()));

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
  <div>
    <h2 class="sec-title">Calendar</h2>

    <div class="cal-card">
      <CalendarToolbar :title="anchor.toDateString()" :view="view" @prev="step(-1)" @next="step(1)" @today="reset" @update:view="view = $event" />

      <MonthCalendar v-if="view === 'traditional'" :anchor="anchor" :events="events" />
      <WeekCalendar v-else-if="view === 'scheduler'" :anchor="anchor" :events="events" />
      <DayCalendar v-else :anchor="anchor" :events="events" />
    </div>

    <p class="note">Three calendar types on one state: Traditional (month grid), Scheduler (week), Granular (day).</p>

    <div class="cal-card">
      <h3 class="sub">SchedulerView <span class="hint">— full wired surface with its own state + event dialog</span></h3>
      <SchedulerView />
    </div>
  </div>
</template>

<style scoped>
.sec-title {
  margin: 0 0 16px;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.cal-card {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  padding: 16px;
  margin-bottom: 20px;
  overflow: hidden;
}
.sub {
  margin: 0 0 12px;
  font-size: var(--fs-14);
  font-weight: var(--fw-600);
}
.hint {
  font-size: var(--fs-12);
  font-weight: var(--fw-400);
  color: var(--text-3);
}
.note {
  font-size: var(--fs-12);
  color: var(--text-3);
  margin: 0 0 20px;
}
</style>
