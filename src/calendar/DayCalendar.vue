<script setup lang="ts">
import { computed } from "vue";
import type { CalendarEvent } from "./model";
import { DAYS, sameDay } from "./model";
import { nowTop, placeDay } from "./placement";
import EventTile from "./EventTile.vue";

/**
 * Granular — the single-day fine timeline. Hour (and half-hour) rows, events
 * positioned by time with overlap lanes, all-day strip, current-time marker.
 */

const props = defineProps<{
  anchor: Date;
  events: CalendarEvent[];
}>();

const emit = defineEmits<{ open: [e: CalendarEvent] }>();

const HOUR_START = 8;
const HOUR_END = 22;
const HOUR_PX = 44;
const now = new Date();

const hours = computed(() => Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i));
const halfHours = computed(() => {
  const out: { label: string; top: number }[] = [];
  for (let h = HOUR_START; h < HOUR_END; h++) {
    out.push({ label: `${String(h).padStart(2, "0")}:30`, top: ((h - HOUR_START) + 0.5) * HOUR_PX });
  }
  return out;
});

const allDay = computed(() => props.events.filter((e) => e.allDay && sameDay(e.start, props.anchor)));
const placed = computed(() => placeDay(props.anchor, props.events, HOUR_START, HOUR_END, HOUR_PX));
const nowLine = computed(() => nowTop(props.anchor, HOUR_START, HOUR_END, HOUR_PX, now));
</script>

<template>
  <div class="day-cal">
    <header class="day-cal__head" :class="{ 'is-today': sameDay(anchor, now) }">
      <span class="day-cal__dayname">{{ DAYS[anchor.getDay()] }}</span>
      <span class="day-cal__daynum">{{ anchor.toLocaleDateString(undefined, { month: "short", day: "numeric" }) }}</span>
    </header>

    <div v-if="allDay.length" class="day-cal__allday">
      <span class="day-cal__gutter day-cal__gutter--label">all-day</span>
      <EventTile
        v-for="e in allDay"
        :key="e.id"
        :event="e"
        class="day-cal__allday-tile"
        @open="emit('open', e)"
      />
    </div>

    <div class="day-cal__body">
      <div class="day-cal__hours">
        <span v-for="h in hours" :key="h" class="day-cal__hour" :style="{ top: (h - HOUR_START) * HOUR_PX + 'px' }">
          {{ String(h).padStart(2, "0") }}{{ h === HOUR_END ? "" : ":00" }}
        </span>
      </div>
      <div class="day-cal__track" :style="{ height: (HOUR_END - HOUR_START) * HOUR_PX + 'px' }">
        <span v-for="h in hours" :key="h" class="day-cal__line" :style="{ top: (h - HOUR_START) * HOUR_PX + 'px' }" />
        <span v-for="hh in halfHours" :key="hh.label" class="day-cal__line day-cal__line--faint" :style="{ top: hh.top + 'px' }" />
        <EventTile
          v-for="p in placed"
          :key="p.event.id"
          :event="p.event"
          class="day-cal__ev"
          :style="{ position: 'absolute', top: p.top + 'px', height: p.height + 'px', left: p.left + '%', width: p.width + '%' }"
          @open="emit('open', p.event)"
        />
        <span v-if="nowLine !== null" class="day-cal__now" :style="{ top: nowLine + 'px' }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.day-cal {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-1);
}
.day-cal__head {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--surface-2);
  border-bottom: 1px solid var(--line);
}
.day-cal__dayname {
  font: 600 var(--fs-13)/1.4 var(--font-body);
  color: var(--text);
}
.day-cal__daynum {
  font: 400 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-3);
}
.day-cal__head.is-today .day-cal__dayname {
  color: var(--accent);
}
.day-cal__allday {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}
.day-cal__gutter--label {
  font: 600 var(--fs-10)/1.4 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-3);
}
.day-cal__allday-tile {
  width: auto;
  min-width: 120px;
  flex: none;
}
.day-cal__body {
  display: flex;
  overflow: auto;
}
.day-cal__hours {
  position: relative;
  flex: none;
  width: 56px;
}
.day-cal__hour {
  position: absolute;
  right: 6px;
  transform: translateY(-50%);
  font: 400 var(--fs-10)/1 var(--font-body);
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
.day-cal__track {
  position: relative;
  flex: 1;
  min-width: 0;
  margin-right: var(--space-1);
}
.day-cal__line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--divider);
  pointer-events: none;
}
.day-cal__line--faint {
  background: var(--surface-3);
}
.day-cal__ev {
  z-index: 2;
  box-shadow: var(--shadow-card);
}
.day-cal__now {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--err);
  z-index: 3;
  pointer-events: none;
}
.day-cal__now::before {
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
