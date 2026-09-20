<script setup lang="ts">
import type { IconName } from "./icons";
import AppIcon from "./AppIcon.vue";

withDefaults(
  defineProps<{
    tint?: "neutral" | "accent" | "ok" | "warn" | "err" | "info" | "run";
    closable?: boolean;
    icon?: IconName;
    selected?: boolean;
  }>(),
  { tint: "neutral", closable: false, selected: false },
);

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <span class="app-chip" :class="[`is-${tint}`, { 'is-selected': selected, 'is-closable': closable }]">
    <AppIcon v-if="icon" :name="icon" :size="12" />
    <span class="app-chip__label"><slot /></span>
    <button v-if="closable" class="app-chip__close" type="button" aria-label="Remove" @click="emit('close')">
      <AppIcon name="close" :size="10" />
    </button>
  </span>
</template>

<style scoped>
.app-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text-2);
  font: 500 var(--fs-12)/1.5 var(--font-body);
  max-width: 100%;
}
.app-chip__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.app-chip:not(.is-closable) {
  user-select: none;
}
.is-accent {
  background: var(--accent-soft);
  border-color: transparent;
  color: var(--accent);
}
.is-ok {
  background: var(--ok-soft);
  border-color: transparent;
  color: var(--ok);
}
.is-warn {
  background: var(--warn-soft);
  border-color: transparent;
  color: var(--warn);
}
.is-err {
  background: var(--err-soft);
  border-color: transparent;
  color: var(--err);
}
.is-info {
  background: var(--info-soft);
  border-color: transparent;
  color: var(--info);
}
.is-run {
  background: var(--run-soft);
  border-color: transparent;
  color: var(--run);
}
.is-selected {
  border-color: var(--accent);
  color: var(--text);
}
.app-chip__close {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: none;
  background: transparent;
  color: currentColor;
  opacity: 0.7;
  cursor: pointer;
  border-radius: var(--radius-xs);
}
.app-chip__close:hover {
  opacity: 1;
}
</style>
