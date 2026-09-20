<script setup lang="ts">
import { AppBadge } from "../kit";
import type { BoardStat } from "./model";

withDefaults(
  defineProps<{
    title?: string;
    stats?: BoardStat[];
  }>(),
  { title: "", stats: () => [] },
);
</script>

<template>
  <header class="board-toolbar">
    <div class="board-toolbar__left">
      <h2 v-if="title" class="board-toolbar__title">{{ title }}</h2>
      <span v-for="s in stats" :key="s.label" class="board-toolbar__stat">
        <AppBadge :tint="s.tint ?? 'neutral'">{{ s.value }}</AppBadge>
        <span class="board-toolbar__stat-label">{{ s.label }}</span>
      </span>
    </div>
    <div class="board-toolbar__right">
      <slot />
    </div>
  </header>
</template>

<style scoped>
.board-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--divider);
  margin-bottom: var(--space-3);
}
.board-toolbar__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}
.board-toolbar__title {
  margin: 0;
  font: 600 var(--fs-16)/1.4 var(--font-body);
  color: var(--text);
}
.board-toolbar__stat {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-2);
  font: 400 var(--fs-12)/1.4 var(--font-body);
}
.board-toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
