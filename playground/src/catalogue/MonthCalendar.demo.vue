<script setup lang="ts">
/** Catalogue demo: a fixed January 2026 month with stacked events and an all-day band. */
import { MonthCalendar, ev, type CalendarEvent } from "@vuedemonde";

const anchor = new Date(2026, 0, 5);
const at = (day: number, h: number, m = 0) => new Date(2026, 0, day, h, m);
const events: CalendarEvent[] = [
  ev("sync", "Platform sync", at(5, 9, 0), at(5, 9, 45), "indigo", false, "Ops room 2"),
  ev("standup", "Stand-up", at(5, 9, 45), at(5, 10, 15), "sky", false, "Zoom"),
  ev("design", "Design review", at(5, 11, 0), at(5, 12, 0), "rose", false, "Studio"),
  ev("offsite", "Company offsite", new Date(2026, 0, 7), new Date(2026, 0, 7), "emerald", true),
  ev("dispatch", "Field dispatch", at(7, 14, 0), at(7, 15, 30), "orange"),
  ev("release", "Release cut v0.2", at(8, 16, 0), at(8, 17, 0), "emerald"),
  ev("plan", "Sprint planning", at(4, 10, 0), at(4, 11, 30), "indigo"),
  ev("retro", "Sprint retro", at(9, 15, 0), at(9, 16, 0), "amber"),
  ev("infra", "Infra window — Sydney", at(12, 13, 0), at(12, 14, 30), "emerald", false, "DC-1"),
  ev("board", "Board review", at(14, 12, 30), at(14, 13, 15), "sky"),
];
</script>

<template>
  <div class="cat-demo">
    <MonthCalendar class="cat-fill" :anchor="anchor" :events="events" />
  </div>
</template>
