<script setup lang="ts">
import { ref } from "vue";
import { AppIcon } from "./index";

const props = withDefaults(
  defineProps<{
    items: unknown[];
    layout?: "list" | "grid";
    /** CSS grid-template-columns for the grid layout. */
    gridCols?: string;
  }>(),
  { layout: "list", gridCols: "repeat(auto-fill, minmax(220px, 1fr))" },
);

const emit = defineEmits<{ "update:layout": [layout: "list" | "grid"] }>();

const internal = ref<"list" | "grid">(props.layout);
const current = () => props.layout ?? internal.value;

function setLayout(l: "list" | "grid"): void {
  internal.value = l;
  emit("update:layout", l);
}
</script>

<template>
  <div class="data-view">
    <div class="data-view__toggle" role="group" aria-label="Data view">
      <button
        class="data-view__btn"
        :class="{ 'is-active': current() === 'list' }"
        type="button"
        aria-label="List view"
        @click="setLayout('list')"
      >
        <AppIcon name="copy" :size="14" />
      </button>
      <button
        class="data-view__btn"
        :class="{ 'is-active': current() === 'grid' }"
        type="button"
        aria-label="Grid view"
        @click="setLayout('grid')"
      >
        <AppIcon name="settings" :size="14" />
      </button>
    </div>
    <div class="data-view__content" :class="`is-${current()}`" :style="current() === 'grid' ? { gridTemplateColumns: gridCols } : undefined">
      <div v-for="(item, i) in items" :key="i" class="data-view__item">
        <slot name="item" :item="item" :index="i" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}
.data-view__toggle {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  align-self: flex-start;
}
.data-view__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
}
.data-view__btn:hover {
  color: var(--text);
}
.data-view__btn.is-active {
  background: var(--accent-soft);
  color: var(--accent);
}
.data-view__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.data-view__content.is-grid {
  display: grid;
  gap: var(--space-2);
}
</style>
