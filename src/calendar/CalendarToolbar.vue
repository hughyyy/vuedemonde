<script setup lang="ts">
import { AppIcon } from "../kit";
import type { CalendarViewId } from "./useCalendarState";
import { CALENDAR_VIEWS } from "./useCalendarState";

withDefaults(
  defineProps<{
    title: string;
    view: CalendarViewId;
  }>(),
  {},
);

const emit = defineEmits<{
  prev: [];
  next: [];
  today: [];
  "update:view": [view: CalendarViewId];
}>();
</script>

<template>
  <div class="cal-toolbar">
    <div class="cal-toolbar__nav">
      <button class="cal-toolbar__btn" type="button" aria-label="Previous" @click="emit('prev')">
        <AppIcon name="chevron-left" :size="15" />
      </button>
      <button class="cal-toolbar__today" type="button" @click="emit('today')">Today</button>
      <button class="cal-toolbar__btn" type="button" aria-label="Next" @click="emit('next')">
        <AppIcon name="chevron-right" :size="15" />
      </button>
    </div>
    <h2 class="cal-toolbar__title">{{ title }}</h2>
    <div class="cal-toolbar__views" role="tablist" aria-label="Calendar view">
      <button
        v-for="v in CALENDAR_VIEWS"
        :key="v.id"
        class="cal-toolbar__view"
        :class="{ 'is-active': view === v.id }"
        type="button"
        role="tab"
        :aria-selected="view === v.id"
        @click="emit('update:view', v.id)"
      >
        {{ v.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cal-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--divider);
}
.cal-toolbar__nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.cal-toolbar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text-2);
  cursor: pointer;
  transition: background var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out);
}
.cal-toolbar__btn:hover {
  background: var(--surface-2);
  color: var(--text);
}
.cal-toolbar__today {
  height: 30px;
  padding: 0 var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text);
  font: 500 var(--fs-13)/1.4 var(--font-body);
  cursor: pointer;
}
.cal-toolbar__today:hover {
  background: var(--surface-2);
}
.cal-toolbar__title {
  margin: 0;
  font: 600 var(--fs-15)/1.4 var(--font-body);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cal-toolbar__views {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
}
.cal-toolbar__view {
  padding: var(--space-1) var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  font: 500 var(--fs-12)/1.4 var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}
.cal-toolbar__view:hover {
  color: var(--text);
}
.cal-toolbar__view.is-active {
  background: var(--accent-soft);
  color: var(--accent);
}
</style>
