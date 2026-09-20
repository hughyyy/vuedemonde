<script setup lang="ts">
import { AppIcon, AppTooltip } from "./index";
import type { DockItem } from "./types";

/** Dock — floating icon bar (macOS-style) with hover magnification + tooltips. */

withDefaults(
  defineProps<{
    items: DockItem[];
  }>(),
  {},
);

const emit = defineEmits<{ select: [id: string] }>();
</script>

<template>
  <div class="dock" role="toolbar" aria-label="Dock">
    <AppTooltip v-for="item in items" :key="item.id" :text="item.label" placement="top">
      <button
        class="dock__btn"
        type="button"
        :aria-label="item.label"
        @click="emit('select', item.id)"
      >
        <AppIcon :name="item.icon" :size="18" />
      </button>
    </AppTooltip>
  </div>
</template>

<style scoped>
.dock {
  display: inline-flex;
  align-items: flex-end;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  background: var(--surface-1);
  box-shadow: var(--shadow-overlay);
}
.dock__btn {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--text-2);
  cursor: pointer;
  transition: transform var(--dur-2) var(--ease-out), background var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out);
}
.dock__btn:hover {
  transform: translateY(-6px) scale(1.12);
  background: var(--accent-soft);
  color: var(--accent);
}
@media (prefers-reduced-motion: reduce) {
  .dock__btn {
    transition: none;
  }
}
</style>
