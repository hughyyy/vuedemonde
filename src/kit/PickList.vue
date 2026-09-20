<script setup lang="ts">
import { ref } from "vue";
import { AppIcon } from "./index";

/**
 * PickList — transfer items between two panel lists with `>`/`<` (and
 * `>>`/`<<`) controls and per-side multi-selection.
 */

const props = withDefaults(
  defineProps<{
    source: unknown[];
    target: unknown[];
  }>(),
  {},
);

const emit = defineEmits<{
  "update:source": [items: unknown[]];
  "update:target": [items: unknown[]];
}>();

const selS = ref<Set<number>>(new Set());
const selT = ref<Set<number>>(new Set());

function toggle(set: Set<number>, i: number): void {
  const s = new Set(set);
  if (s.has(i)) s.delete(i);
  else s.add(i);
  set === selS.value ? (selS.value = s) : (selT.value = s);
}

function transfer(dir: "s2t" | "t2s", all = false): void {
  if (dir === "s2t") {
    const idxs = all ? props.source.map((_, i) => i) : Array.from(selS.value).sort((a, b) => b - a);
    const moved = idxs.map((i) => props.source[i]!);
    const remaining = props.source.filter((_, i) => !idxs.includes(i));
    const nextTarget = props.target.concat(all ? moved : moved.slice().reverse());
    emit("update:source", remaining);
    emit("update:target", nextTarget);
  } else {
    const idxs = all ? props.target.map((_, i) => i) : Array.from(selT.value).sort((a, b) => b - a);
    const moved = idxs.map((i) => props.target[i]!);
    const remaining = props.target.filter((_, i) => !idxs.includes(i));
    const nextSource = props.source.concat(all ? moved : moved.slice().reverse());
    emit("update:target", remaining);
    emit("update:source", nextSource);
  }
  selS.value = new Set();
  selT.value = new Set();
}
</script>

<template>
  <div class="pick-list">
    <div class="pick-list__panel">
      <h4 class="pick-list__title">Available</h4>
      <ul class="pick-list__items">
        <li
          v-for="(item, i) in source"
          :key="i"
          class="pick-list__item"
          :class="{ 'is-selected': selS.has(i) }"
          @click="toggle(selS, i)"
        >
          <slot name="item" :item="item" :index="i">{{ String(item) }}</slot>
        </li>
      </ul>
    </div>

    <div class="pick-list__controls">
      <button type="button" aria-label="Move selected right" :disabled="!selS.size" @click="transfer('s2t')"><AppIcon name="chevron-right" :size="15" /></button>
      <button type="button" aria-label="Move all right" @click="transfer('s2t', true)"><AppIcon name="copy" :size="15" /></button>
      <button type="button" aria-label="Move all left" @click="transfer('t2s', true)"><AppIcon name="copy" :size="15" class="is-flip" /></button>
      <button type="button" aria-label="Move selected left" :disabled="!selT.size" @click="transfer('t2s')"><AppIcon name="chevron-left" :size="15" /></button>
    </div>

    <div class="pick-list__panel">
      <h4 class="pick-list__title">Selected</h4>
      <ul class="pick-list__items">
        <li
          v-for="(item, i) in target"
          :key="i"
          class="pick-list__item"
          :class="{ 'is-selected': selT.has(i) }"
          @click="toggle(selT, i)"
        >
          <slot name="item" :item="item" :index="i">{{ String(item) }}</slot>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.pick-list {
  display: flex;
  gap: var(--space-2);
  align-items: stretch;
  min-width: min(480px, 100%);
}
.pick-list__panel {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.pick-list__title {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--line);
  font: 600 var(--fs-11)/1.4 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-3);
}
.pick-list__items {
  list-style: none;
  margin: 0;
  padding: var(--space-1);
  overflow-y: auto;
  max-height: 220px;
  flex: 1;
}
.pick-list__item {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--text);
  font: 400 var(--fs-13)/1.6 var(--font-body);
  cursor: pointer;
}
.pick-list__item:hover {
  background: var(--surface-2);
}
.pick-list__item.is-selected {
  background: var(--accent-soft);
  color: var(--accent);
}
.pick-list__controls {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
}
.pick-list__controls button {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text-2);
  cursor: pointer;
}
.pick-list__controls button:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text);
}
.pick-list__controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.is-flip {
  transform: scaleX(-1);
}
</style>
