<script setup lang="ts">
/** Catalogue demo: positioned tiles, one per event tint, at grid-slot size. */
import { EventTile, ev } from "@vuedemonde";

const at = (h: number, m = 0) => new Date(2026, 0, 5, h, m);
const events = [
  ev("review", "Design review", at(10, 0), at(10, 45), "indigo", false, "Studio"),
  ev("standup", "Stand-up", at(9, 45), at(10, 15), "sky", false, "Zoom"),
  ev("release", "Release cut", at(16, 0), at(17, 0), "emerald"),
  ev("retro", "Sprint retro", at(15, 0), at(16, 0), "amber"),
  ev("dispatch", "Field dispatch", at(14, 0), at(15, 30), "orange", false, "Ops room 2"),
  ev("incident", "Incident call", at(11, 0), at(12, 0), "rose"),
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
      <div v-for="e in events" :key="e.id" style="height: 52px">
        <EventTile :event="e" />
      </div>
    </div>
  </div>
</template>
