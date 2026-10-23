<script setup lang="ts">
/** Catalogue demo: the bundled icon set at two sizes. */
import { AppIcon, type IconName } from "@vuedemonde";

const icons: IconName[] = [
  "run", "stop", "plus", "settings", "close", "chevron-down", "search", "info",
  "check", "warn", "trash", "edit", "copy", "spinner", "folder", "node", "theme",
  "home", "inbox", "bell", "chart", "users", "calendar", "credit", "star",
  "more", "sidebar", "moon", "eye",
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-icons">
      <span v-for="n in icons" :key="n" class="cat-icons__cell" :title="n">
        <AppIcon :name="n" :size="18" />
        <span class="cat-label">{{ n }}</span>
      </span>
    </div>
    <div class="cat-row">
      <AppIcon name="star" :size="12" />
      <AppIcon name="star" :size="18" />
      <AppIcon name="star" :size="26" />
      <AppIcon name="star" :size="34" />
    </div>
  </div>
</template>

<style scoped>
.cat-icons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(74px, 1fr));
  gap: 6px;
  width: 100%;
}
.cat-icons__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 2px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  color: var(--text-2);
  text-align: center;
  overflow: hidden;
}
</style>
