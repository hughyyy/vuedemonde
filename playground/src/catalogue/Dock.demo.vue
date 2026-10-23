<script setup lang="ts">
/** Catalogue demo: floating icon dock with hover magnification. */
import { ref } from "vue";
import { Dock, type DockItem } from "@vuedemonde";

const picked = ref("runs");

const items: DockItem[] = [
  { id: "runs", label: "Runs", icon: "run" },
  { id: "dashboards", label: "Dashboards", icon: "chart" },
  { id: "calendar", label: "Calendar", icon: "calendar" },
  { id: "team", label: "Team", icon: "users" },
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "settings", label: "Settings", icon: "settings" },
];
</script>

<template>
  <div class="cat-demo cat-fill">
    <Dock :items="items" @select="(id: string) => (picked = id)" />
    <span class="cat-label">{{ picked ? `selected: ${picked}` : "click an icon" }}</span>
    <span class="cat-label">hover lifts and magnifies the icon · tooltips on top</span>
  </div>
</template>
