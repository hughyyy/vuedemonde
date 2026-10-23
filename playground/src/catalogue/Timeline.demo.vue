<script setup lang="ts">
/** Catalogue demo: an activity stream covering every tint and icon. */
import { Timeline, type TimelineItem } from "@vuedemonde";

const items: TimelineItem[] = [
  { id: "t1", title: "Repo scaffolded", time: "09:00", icon: "check", tint: "ok", content: "Build config and CI wired up." },
  { id: "t2", title: "Components ported", time: "10:30", icon: "node", tint: "run", content: "Kit moved onto the design tokens." },
  { id: "t3", title: "Catalogue published", time: "12:15", icon: "eye", tint: "info", content: "Per-component gallery is live." },
  { id: "t4", title: "Contrast pass", time: "13:40", icon: "warn", tint: "warn", content: "Two themes failed AA on captions." },
  { id: "t5", title: "v0.2.0 tagged", time: "15:05", icon: "star", tint: "accent" },
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill">
      <Timeline :items="items" />
    </div>
  </div>
</template>
