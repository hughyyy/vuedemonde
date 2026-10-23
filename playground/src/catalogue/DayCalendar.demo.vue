<script setup lang="ts">
/** Catalogue demo: a single day with side-by-side lanes and an all-day band. */
import { DayCalendar, ev, type CalendarEvent } from "@vuedemonde";

const anchor = new Date(2026, 0, 5);
const at = (h: number, m = 0) => new Date(2026, 0, 5, h, m);
const events: CalendarEvent[] = [
  ev("sync", "Platform sync", at(9, 0), at(9, 45), "indigo", false, "Ops room 2"),
  ev("standup", "Stand-up", at(9, 45), at(10, 15), "sky", false, "Zoom"),
  ev("design", "Design review — tokens", at(11, 0), at(12, 30), "rose", false, "Studio"),
  ev("dispatch", "Field dispatch", at(14, 0), at(15, 30), "orange"),
  ev("release", "Release cut v0.2", at(16, 0), at(17, 0), "emerald"),
  ev("retro", "Sprint retro", at(17, 0), at(18, 0), "amber"),
  ev("window", "Infra window", new Date(2026, 0, 5), new Date(2026, 0, 5), "sky", true),
];
</script>

<template>
  <div class="cat-demo">
    <DayCalendar class="cat-fill" :anchor="anchor" :events="events" />
  </div>
</template>
