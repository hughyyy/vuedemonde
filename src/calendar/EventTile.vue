<script setup lang="ts">
import type { CalendarEvent } from "./model";
import { EVENT_TINTS } from "./model";
import { AppIcon } from "../kit";

withDefaults(
  defineProps<{
    event: CalendarEvent;
  }>(),
  {},
);

const emit = defineEmits<{ open: [] }>();

function tintOf(e: CalendarEvent) {
  return EVENT_TINTS[e.tint ?? "indigo"];
}
</script>

<template>
  <button class="event-tile" type="button" :title="event.title" :style="{ background: tintOf(event).bg, color: tintOf(event).text }" @click.stop="emit('open')">
    <span class="event-tile__bar" :style="{ background: tintOf(event).text }" aria-hidden="true" />
    <span class="event-tile__body">
      <span class="event-tile__title">{{ event.title }}</span>
      <span v-if="event.location || !event.allDay" class="event-tile__meta">
        <AppIcon name="sidebar" :size="10" />
        {{ event.location || "all-day" }}
      </span>
    </span>
  </button>
</template>

<style scoped>
/* positioned tile for week/day grids: fills its slot, colored via inline style */
.event-tile {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
}
.event-tile:hover {
  filter: brightness(1.06);
}
.event-tile__bar {
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 3px;
  border-radius: var(--radius-pill);
}
.event-tile__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 5px;
}
.event-tile__title {
  font: 500 var(--fs-11)/1.4 var(--font-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.event-tile__meta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font: 400 var(--fs-10)/1.4 var(--font-body);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
