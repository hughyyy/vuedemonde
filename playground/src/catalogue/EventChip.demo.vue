<script setup lang="ts">
/** Catalogue demo: cell and block chips across all six event tints. */
import { EventChip, ev, type CalendarEvent } from "@vuedemonde";

const at = (h: number, m = 0) => new Date(2026, 0, 5, h, m);
const events: CalendarEvent[] = [
  ev("review", "Design review", at(10, 0), at(10, 45), "indigo", false, "Studio"),
  ev("standup", "Stand-up", at(9, 45), at(10, 15), "sky"),
  ev("release", "Release cut", at(16, 0), at(17, 0), "emerald"),
  ev("retro", "Sprint retro", at(15, 0), at(16, 0), "amber"),
  ev("dispatch", "Field dispatch", at(14, 0), at(15, 30), "orange"),
  ev("incident", "Incident call", at(11, 0), at(12, 0), "rose"),
];

const holiday = ev("holiday", "Company offsite", new Date(2026, 0, 6), new Date(2026, 0, 6), "emerald", true);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <span class="cat-label">cell — month grid rows</span>
      <div class="cat-fill" style="padding: 8px; border: 1px solid var(--line); border-radius: var(--radius-md)">
        <div class="cat-col" style="gap: 2px">
          <EventChip v-for="e in events" :key="e.id" :event="e" />
          <EventChip :event="holiday" />
        </div>
      </div>
    </div>
    <div class="cat-col">
      <span class="cat-label">block — week and day grids</span>
      <EventChip v-for="e in events" :key="`b-${e.id}`" :event="e" layout="block" />
      <EventChip :event="holiday" layout="block" />
    </div>
  </div>
</template>
