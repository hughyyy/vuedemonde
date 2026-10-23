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
      <span v-if="event.location || !event.allDay" class="event-tile__meta" aria-hidden="true">
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
  /* Containment context: the meta line hides itself in slots too short to
   * hold two lines (see the @container rule at the bottom). Height is set by
   * the calendar grid math, so a media/attribute query cannot express this. */
  container-type: size;
  border: none;
  border-radius: var(--radius-sm);
  /* 1px vertical padding: a 19px slot then holds exactly one 15px title line
   * (2px padding left the body 15px for 15px of text and still clipped). */
  padding: 1px 6px;
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
  min-height: 0;
  /* A short event slot (30 min ≈ 20 px) is shorter than a title line, so the
   * body must clip at the line boundary instead of squashing the glyphs:
   * without `overflow: hidden` here the title was measured at 8 px tall while
   * its text needed 15 px, slicing every short event in half. */
  overflow: hidden;
  margin-left: 5px;
}
.event-tile__title {
  font: 500 var(--fs-11)/1.4 var(--font-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: none;
  line-height: 15px;
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
  flex: none;
  line-height: 12px;
}

/* One 15px title line fits a ~19px slot; below that the 12px meta line can only
 * be shown clipped, so it goes. */
@container (max-height: 26px) {
  .event-tile__meta {
    display: none;
  }
}

/* A sub-30-minute slot (~14px) is shorter than a 15px line: tighten the title to
 * the slot so the label stays readable instead of being cut through mid-glyph. */
@container (max-height: 17px) {
  .event-tile__title {
    font-size: var(--fs-10);
    line-height: 11px;
  }
}
</style>
