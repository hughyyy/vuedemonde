<script setup lang="ts">
import type { TabDef } from "./types";

const props = withDefaults(
  defineProps<{
    tabs: TabDef[];
    modelValue: string;
  }>(),
  {},
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

function select(id: string): void {
  const tab = props.tabs.find((t) => t.id === id);
  if (tab?.disabled) return;
  emit("update:modelValue", id);
}

function onKeydown(e: KeyboardEvent, index: number): void {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  e.preventDefault();
  const step = e.key === "ArrowRight" ? 1 : -1;
  const enabled = props.tabs.filter((t) => !t.disabled);
  const cur = Math.max(0, enabled.findIndex((t) => t.id === props.modelValue));
  const next = enabled[(cur + step + enabled.length) % enabled.length]!;
  select(next.id);
  (e.target as HTMLElement).closest("[role=tablist]")?.querySelectorAll<HTMLElement>("[role=tab]")[index]?.focus();
}
</script>

<template>
  <div class="app-tabs">
    <div class="app-tabs__bar" role="tablist" aria-label="Tabs">
      <button
        v-for="(t, i) in tabs"
        :key="t.id"
        class="app-tabs__tab"
        :class="{ 'is-active': modelValue === t.id, 'is-disabled': t.disabled }"
        role="tab"
        :aria-selected="modelValue === t.id"
        :disabled="t.disabled"
        @click="select(t.id)"
        @keydown="onKeydown($event, i)"
      >
        {{ t.label }}
        <span v-if="t.badge" class="app-tabs__badge">{{ t.badge }}</span>
      </button>
    </div>
    <div class="app-tabs__pane">
      <slot :name="`panel-${modelValue}`" />
    </div>
  </div>
</template>

<style scoped>
.app-tabs {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
}
.app-tabs__bar {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--divider);
  overflow-x: auto;
}
.app-tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  color: var(--text-2);
  font: 500 var(--fs-13)/1.4 var(--font-body);
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out);
}
.app-tabs__tab:hover:not(:disabled) {
  color: var(--text);
}
.app-tabs__tab.is-active {
  color: var(--text);
  border-bottom-color: var(--accent);
}
.app-tabs__tab.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.app-tabs__badge {
  padding: 0 var(--space-1);
  border-radius: var(--radius-pill);
  background: var(--surface-3);
  color: var(--text-3);
  font: 600 var(--fs-11)/1.5 var(--font-body);
}
.app-tabs__tab.is-active .app-tabs__badge {
  background: var(--accent-soft);
  color: var(--accent);
}
</style>
