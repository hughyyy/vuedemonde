<script setup lang="ts">
/** Catalogue demo: one fixed week with overlapping events and an all-day strip. */
import { WeekCalendar, ev, type CalendarEvent } from "@vuedemonde";

const anchor = new Date(2026, 0, 5);
const at = (day: number, h: number, m = 0) => new Date(2026, 0, day, h, m);
const events: CalendarEvent[] = [
  ev("sync", "Platform sync", at(5, 9, 0), at(5, 9, 45), "indigo", false, "Ops room 2"),
  ev("standup", "Stand-up", at(5, 9, 45), at(5, 10, 15), "sky", false, "Zoom"),
  ev("design", "Design review — tokens", at(5, 11, 0), at(5, 12, 0), "rose", false, "Studio"),
  ev("offsite", "Company offsite", new Date(2026, 0, 7), new Date(2026, 0, 7), "emerald", true),
  ev("dispatch", "Field dispatch", at(7, 14, 0), at(7, 15, 30), "orange"),
  ev("release", "Release cut v0.2", at(8, 16, 0), at(8, 17, 0), "emerald"),
  ev("retro", "Sprint retro", at(9, 15, 0), at(9, 16, 0), "amber"),
  ev("infra", "Infra window", at(9, 13, 0), at(9, 14, 30), "sky", false, "DC-1"),
];
</script>

<template>
  <div class="cat-demo">
    <WeekCalendar class="cat-fill" :anchor="anchor" :events="events" />
  </div>
</template>
