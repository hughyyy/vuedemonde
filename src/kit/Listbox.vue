<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { AppIcon } from "./index";
import type { SelectOption } from "./types";

/** Listbox — single/multiple selection from a (filterable) list.
 *  Keyboard: Tab focuses the list; ↑/↓ move the active option (skipping
 *  disabled), Home/End jump, Enter/Space pick. */

const props = withDefaults(
  defineProps<{
    options: SelectOption[];
    modelValue: string | string[];
    multiple?: boolean;
    filter?: boolean;
    placeholder?: string;
  }>(),
  { multiple: false, filter: false, placeholder: "Search…" },
);

const emit = defineEmits<{ "update:modelValue": [v: string | string[]] }>();

const q = ref("");
const listId = useId();
/** index into `filtered` of the keyboard-active option (null = none yet) */
const activeIdx = ref<number | null>(null);

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase();
  return s ? props.options.filter((o) => o.label.toLowerCase().includes(s)) : props.options;
});

function isSel(o: SelectOption): boolean {
  return props.multiple ? (props.modelValue as string[]).includes(o.value) : props.modelValue === o.value;
}

function onPick(o: SelectOption): void {
  if (o.disabled) return;
  if (props.multiple) {
    const arr = props.modelValue as string[];
    emit("update:modelValue", arr.includes(o.value) ? arr.filter((v) => v !== o.value) : [...arr, o.value]);
  } else {
    emit("update:modelValue", o.value);
  }
}

/** next focusable index from `from`, stepping `dir` (±1), wrapping; null when none. */
function step(from: number | null, dir: 1 | -1): number | null {
  const n = filtered.value.length;
  if (!n) return null;
  let i = (from ?? (dir === 1 ? -1 : 0)) + dir;
  for (let k = 0; k < n; k++) {
    const idx = ((i % n) + n) % n;
    if (!filtered.value[idx]!.disabled) return idx;
    i += dir;
  }
  return null; // every option disabled
}

function onKeydown(e: KeyboardEvent): void {
  switch (e.key) {
    case "ArrowDown":
    case "ArrowUp": {
      e.preventDefault();
      const next = step(activeIdx.value, e.key === "ArrowDown" ? 1 : -1);
      activeIdx.value = next;
      if (next !== null) {
        document.getElementById(`${listId}-opt-${next}`)?.scrollIntoView({ block: "nearest" });
      }
      break;
    }
    case "Home": {
      e.preventDefault();
      activeIdx.value = step(-1, 1);
      break;
    }
    case "End": {
      e.preventDefault();
      activeIdx.value = step(filtered.value.length, -1);
      break;
    }
    case "Enter":
    case " ": {
      e.preventDefault();
      if (activeIdx.value !== null) onPick(filtered.value[activeIdx.value]!);
      break;
    }
  }
}
</script>

<template>
  <div class="listbox" role="listbox" :aria-multiselectable="multiple || undefined">
    <div v-if="filter" class="listbox__search">
      <AppIcon name="search" :size="13" />
      <input v-model="q" type="text" :placeholder="placeholder" />
    </div>
    <ul
      :id="listId"
      class="listbox__items"
      tabindex="0"
      :aria-activedescendant="activeIdx === null ? undefined : `${listId}-opt-${activeIdx}`"
      @keydown="onKeydown"
    >
      <li
        v-for="(o, i) in filtered"
        :key="o.value"
        :id="`${listId}-opt-${i}`"
        class="listbox__item"
        :class="{ 'is-selected': isSel(o), 'is-active': activeIdx === i, 'is-disabled': o.disabled }"
        role="option"
        :aria-selected="isSel(o)"
        @click="onPick(o)"
        @mouseenter="activeIdx = i"
      >
        <span class="listbox__label">{{ o.label }}</span>
        <AppIcon v-if="multiple && isSel(o)" name="check" :size="13" class="listbox__check" />
      </li>
      <li v-if="!filtered.length" class="listbox__empty">No options</li>
    </ul>
  </div>
</template>

<style scoped>
.listbox {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  overflow: hidden;
  min-width: 200px;
}
.listbox__search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--divider);
  color: var(--text-3);
}
.listbox__search input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-13)/1.4 var(--font-body);
}
.listbox__search input:focus {
  outline: none;
}
.listbox__items {
  list-style: none;
  margin: 0;
  padding: var(--space-1);
  max-height: 220px;
  overflow-y: auto;
}
.listbox__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--text);
  font: 400 var(--fs-13)/1.4 var(--font-body);
  cursor: pointer;
}
.listbox__item:hover:not(.is-disabled) {
  background: var(--surface-2);
}
.listbox__item.is-active {
  background: var(--surface-3);
}
.listbox__item.is-selected {
  background: var(--accent-soft);
  color: var(--accent);
}
.listbox__item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.listbox__check {
  flex: none;
}
.listbox__empty {
  padding: var(--space-4);
  text-align: center;
  color: var(--text-3);
  font: 400 var(--fs-12)/1.4 var(--font-body);
}
</style>
