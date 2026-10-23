<script setup lang="ts">
/** Catalogue demo: tab bar with a badged active tab, a disabled tab and its panel. */
import { ref } from "vue";
import { AppTabs, type TabDef } from "@vuedemonde";

const tab = ref("analytics");

const tabs: TabDef[] = [
  { id: "overview", label: "Overview" },
  { id: "analytics", label: "Analytics", badge: 12 },
  { id: "settings", label: "Settings", disabled: true },
];
</script>

<template>
  <div class="cat-demo cat-fill">
    <AppTabs v-model="tab" :tabs="tabs">
      <template #panel-overview>
        <span class="cat-label">Overview — metrics, status and shortcuts.</span>
      </template>
      <template #panel-analytics>
        <span class="cat-label">Analytics — 12 unread events this sprint.</span>
      </template>
    </AppTabs>
    <span class="cat-label">second tab active · third tab disabled</span>
  </div>
</template>
