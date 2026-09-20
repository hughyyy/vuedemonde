<script setup lang="ts">
import type { CalendarEvent } from "./model";
import { fmtTime } from "./model";

withDefaults(
  defineProps<{
    event: CalendarEvent;
    /** cell = compact row (month grid); block = filled pill (week/day/all-day). */
    layout?: "cell" | "block";
  }>(),
  { layout: "cell" },
);

const emit = defineEmits<{ open: [] }>();
</script>

<template>
  <button class="event-chip" :class="`is-${layout}`" type="button" @click.stop="emit('open')">
    <span class="event-chip__time" v-if="layout === 'cell' && !event.allDay && fmtTime(event.start).substring(0, 5)">
      {{ fmtTime(event.start) }}
    </span>
    <span class="event-chip__title">
      <span v-if="event.allDay && layout === 'block'" class="event-chip__allday">●</span>
      {{ event.title }}
    </span>
    <span class="event-chip__loc" v-if="layout === 'block' && event.location">{{ event.location }}</span>
  </button>
</template>

<style scoped>
.event-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  max-width: 100%;
  padding: 0 var(--space-1);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  font: 500 var(--fs-12)/1.6 var(--font-body);
  text-align: left;
  cursor: pointer;
  overflow: hidden;
}
.event-chip.is-cell:hover {
  background: var(--surface-2);
  color: var(--text);
}
.event-chip__time {
  flex: none;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
.event-chip__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.event-chip__loc {
  flex: none;
  opacity: 0.75;
  font-weight: 400;
}
.event-chip__allday {
  color: currentColor;
}

/* block: filled pastel tint pill */
.event-chip.is-block {
  width: 100%;
  justify-content: flex-start;
  padding: 2px var(--space-2);
}
</style>
