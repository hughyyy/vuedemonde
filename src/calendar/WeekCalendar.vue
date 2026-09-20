<script setup lang="ts">
import { computed } from "vue";
import type { CalendarEvent } from "./model";
import { addDays, DAYS, sameDay, startOfWeek } from "./model";
import { nowTop, placeDay } from "./placement";
import EventTile from "./EventTile.vue";

/**
 * Scheduler — the week time-grid. Left hour axis (08–22) × seven day columns,
 * an all-day strip up top, events positioned by start/duration with overlap
 * lanes, and a current-time line.
 */

const props = defineProps<{
  anchor: Date;
  events: CalendarEvent[];
}>();

const emit = defineEmits<{ open: [e: CalendarEvent] }>();

const HOUR_START = 8;
const HOUR_END = 22;
const HOUR_PX = 40;
const now = new Date();

const days = computed(() => {
  const s = startOfWeek(props.anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(s, i));
});

const hours = computed(() =>
  Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i),
);

const weekAllDay = computed(() => {
  const lo = startOfWeek(props.anchor).getTime();
  const hi = lo + 7 * 24 * 3600 * 1000;
  return props.events.filter((e) => e.allDay && e.start.getTime() >= lo && e.start.getTime() < hi);
});

function allDayOf(d: Date): CalendarEvent[] {
  return weekAllDay.value.filter((e) => sameDay(e.start, d));
}

function placed(d: Date): ReturnType<typeof placeDay> {
  return placeDay(d, props.events, HOUR_START, HOUR_END, HOUR_PX);
}

function nowLine(d: Date): number | null {
  return nowTop(d, HOUR_START, HOUR_END, HOUR_PX, now);
}
</script>

<template>
  <div class="week-cal">
    <div class="week-cal__head">
      <span class="week-cal__gutter" />
      <span
        v-for="d in days"
        :key="d.toISOString()"
        class="week-cal__dayhead"
        :class="{ 'is-today': sameDay(d, now) }"
      >
        <span class="week-cal__dayname">{{ DAYS[d.getDay()] }}</span>
        <span class="week-cal__daynum">{{ d.getDate() }}</span>
      </span>
    </div>

    <div v-if="weekAllDay.length" class="week-cal__allday">
      <span class="week-cal__gutter week-cal__gutter--label">all-day</span>
      <div v-for="d in days" :key="d.toISOString()" class="week-cal__allday-col">
        <EventTile
          v-for="e in allDayOf(d)"
          :key="e.id"
          :event="e"
          class="week-cal__allday-tile"
          @open="emit('open', e)"
        />
      </div>
    </div>

    <div class="week-cal__body">
      <div class="week-cal__hours">
        <span
          v-for="h in hours"
          :key="h"
          class="week-cal__hour"
          :style="{ top: (h - HOUR_START) * HOUR_PX + 'px' }"
        >
          {{ String(h).padStart(2, "0") }}
        </span>
      </div>
      <div
        v-for="d in days"
        :key="d.toISOString()"
        class="week-cal__daycol"
        :class="{ 'is-today': sameDay(d, now) }"
        :style="{ height: (HOUR_END - HOUR_START) * HOUR_PX + 'px' }"
      >
        <span
          v-for="h in hours"
          :key="h"
          class="week-cal__line"
          :style="{ top: (h - HOUR_START) * HOUR_PX + 'px' }"
        />
        <EventTile
          v-for="p in placed(d)"
          :key="p.event.id"
          :event="p.event"
          class="week-cal__ev"
          :style="{ position: 'absolute', top: p.top + 'px', height: p.height + 'px', left: p.left + '%', width: p.width + '%' }"
          @open="emit('open', p.event)"
        />
        <span v-if="nowLine(d) !== null" class="week-cal__now" :style="{ top: nowLine(d) + 'px' }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.week-cal {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-1);
  min-width: 0;
}
.week-cal__head {
  display: grid;
  grid-template-columns: 56px repeat(7, 1fr);
  border-bottom: 1px solid var(--line);
  background: var(--surface-2);
}
.week-cal__gutter {
  background: var(--surface-2);
}
.week-cal__dayhead {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: var(--space-1);
}
.week-cal__dayname {
  font: 600 var(--fs-10)/1.4 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-3);
}
.week-cal__daynum {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-pill);
  font: 500 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-2);
}
.week-cal__dayhead.is-today .week-cal__daynum {
  background: var(--accent-gradient);
  color: var(--accent-ink);
  font-weight: var(--fw-700);
}
.week-cal__allday {
  display: grid;
  grid-template-columns: 56px repeat(7, 1fr);
  border-bottom: 1px solid var(--line);
  gap: 2px;
  padding: var(--space-1) 0;
}
.week-cal__gutter--label {
  display: grid;
  place-items: center;
  font: 600 var(--fs-10)/1.4 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-3);
}
.week-cal__allday-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: 0 4px;
}
.week-cal__body {
  display: flex;
}
.week-cal__hours {
  position: relative;
  flex: none;
  width: 56px;
}
.week-cal__hour {
  position: absolute;
  right: 6px;
  transform: translateY(-50%);
  font: 400 var(--fs-10)/1 var(--font-body);
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
.week-cal__daycol {
  position: relative;
  flex: 1;
  min-width: 0;
  border-left: 1px solid var(--divider);
}
.week-cal__daycol.is-today {
  background: var(--accent-soft);
}
.week-cal__line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--divider);
  pointer-events: none;
}
.week-cal__ev {
  z-index: 2;
  box-shadow: var(--shadow-card);
}
.week-cal__now {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--err);
  z-index: 3;
  pointer-events: none;
}
.week-cal__now::before {
  content: "";
  position: absolute;
  left: -1px;
  top: -3px;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--err);
}
</style>
