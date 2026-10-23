<script setup lang="ts">
import { ref } from "vue";
import type { CalendarEvent } from "./model";
import { DAYS, monthMatrix, sameDay } from "./model";
import EventChip from "./EventChip.vue";

/**
 * Traditional — the classic month grid. Seven weekday columns × up to six
 * weeks; each day cell shows the date, stacked events (with "+N more"), and a
 * today highlight.
 */

const props = defineProps<{
  anchor: Date;
  events: CalendarEvent[];
}>();

const emit = defineEmits<{ open: [e: CalendarEvent] }>();

const MAX = 3;
const now = new Date();
const expanded = ref<Set<string>>(new Set());

const weeks = monthMatrix(props.anchor);

function keyOf(d: Date): string {
  return d.toDateString();
}

function dayEvents(d: Date): CalendarEvent[] {
  return props.events.filter((e) => sameDay(e.start, d));
}

function visible(d: Date): { shown: CalendarEvent[]; more: number } {
  const evs = dayEvents(d);
  const all = expanded.value.has(keyOf(d));
  const shown = all ? evs : evs.slice(0, MAX);
  return { shown, more: evs.length - shown.length };
}

function toggle(d: Date): void {
  const k = keyOf(d);
  const s = new Set(expanded.value);
  if (s.has(k)) s.delete(k);
  else s.add(k);
  expanded.value = s;
}
</script>

<template>
  <div class="month-cal">
    <div v-for="d in DAYS" :key="d" class="month-cal__weekday">{{ d }}</div>
    <template v-for="(week, wi) in weeks" :key="wi">
      <div
        v-for="d in week"
        :key="d.toISOString()"
        class="month-cal__day"
        :class="{
          'is-outside': d.getMonth() !== props.anchor.getMonth(),
          'is-today': sameDay(d, now),
        }"
      >
        <span class="month-cal__num">{{ d.getDate() }}</span>
        <div class="month-cal__events">
          <EventChip
            v-for="e in visible(d).shown"
            :key="e.id"
            :event="e"
            layout="cell"
            @open="emit('open', e)"
          />
          <button
            v-if="expanded.has(keyOf(d)) || visible(d).more > 0"
            class="month-cal__more"
            type="button"
            @click="toggle(d)"
          >
            {{ expanded.has(keyOf(d)) ? "show less" : `+${visible(d).more} more` }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.month-cal {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-1);
}
.month-cal__weekday {
  padding: var(--space-2);
  text-align: center;
  font: 600 var(--fs-11)/1.5 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-3);
  background: var(--surface-2);
  border-bottom: 1px solid var(--line);
}
.month-cal__day {
  min-width: 0; /* 1fr tracks must shrink below nowrap chip content or the last columns get pushed out */
  min-height: 96px;
  overflow: hidden;
  padding: var(--space-1) var(--space-2);
  border-right: 1px solid var(--divider);
  border-bottom: 1px solid var(--divider);
}
.month-cal__day:nth-child(-n + 7) {
  border-top: none;
}
.month-cal__day:nth-child(7n) {
  border-right: none;
}
.month-cal__num {
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-bottom: var(--space-1);
  border-radius: var(--radius-pill);
  font: 500 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-2);
}
.month-cal__day.is-today .month-cal__num {
  background: var(--accent-gradient);
  color: var(--accent-ink);
  font-weight: var(--fw-700);
}
.month-cal__day.is-outside {
  background: var(--surface-2);
}
.month-cal__day.is-outside .month-cal__num {
  color: var(--text-3);
}
.month-cal__events {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
  min-width: 0;
}
.month-cal__more {
  align-self: flex-start;
  padding: 0 var(--space-1);
  border: none;
  background: transparent;
  color: var(--text-3);
  font: 400 var(--fs-11)/1.6 var(--font-body);
  cursor: pointer;
}
.month-cal__more:hover {
  color: var(--accent);
}
</style>
