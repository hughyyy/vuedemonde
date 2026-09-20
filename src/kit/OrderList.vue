<script setup lang="ts">
import { ref } from "vue";
import { AppIcon } from "./index";

/**
 * OrderList — reorder a list with up/down (and top/bottom) moves.
 * Mutates the array via `update:modelValue` emits of a fresh array.
 */

const props = withDefaults(
  defineProps<{
    modelValue: unknown[];
    selectable?: boolean;
  }>(),
  { selectable: true },
);

const emit = defineEmits<{ "update:modelValue": [items: unknown[]] }>();

const sel = ref(-1);

function commit(items: unknown[]): void {
  emit("update:modelValue", items);
  sel.value = -1;
}

function move(dir: 1 | -1): void {
  if (sel.value < 0) return;
  const to = sel.value + dir;
  if (to < 0 || to >= props.modelValue.length) return;
  const arr = [...props.modelValue];
  [arr[sel.value], arr[to]] = [arr[to]!, arr[sel.value]!];
  commit(arr);
}
</script>

<template>
  <div class="order-list" role="listbox" aria-label="Orderable list">
    <div class="order-list__col">
      <button class="order-list__btn" type="button" aria-label="Move up" :disabled="sel < 1" @click="move(-1)">
        <AppIcon name="chevron-up" :size="14" />
      </button>
      <button class="order-list__btn" type="button" aria-label="Move down" :disabled="sel < 0 || sel >= modelValue.length - 1" @click="move(1)">
        <AppIcon name="chevron-down" :size="14" />
      </button>
    </div>
    <ul class="order-list__items">
      <li
        v-for="(item, i) in modelValue"
        :key="i"
        class="order-list__item"
        :class="{ 'is-selected': i === sel }"
        role="option"
        :aria-selected="i === sel"
        @click="selectable && (sel = i)"
      >
        <slot name="item" :item="item" :index="i">{{ String(item) }}</slot>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.order-list {
  display: flex;
  gap: var(--space-2);
  align-items: stretch;
  min-width: 220px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  padding: var(--space-1);
}
.order-list__col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
  padding-right: var(--space-1);
  border-right: 1px solid var(--divider);
}
.order-list__btn {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 26px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--text-2);
  cursor: pointer;
}
.order-list__btn:hover:not(:disabled) {
  color: var(--text);
  border-color: var(--line-strong);
}
.order-list__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.order-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
  max-height: 200px;
}
.order-list__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--text);
  font: 400 var(--fs-13)/1.6 var(--font-body);
  cursor: pointer;
}
.order-list__item:hover {
  background: var(--surface-2);
}
.order-list__item.is-selected {
  background: var(--accent-soft);
  color: var(--accent);
}
</style>
