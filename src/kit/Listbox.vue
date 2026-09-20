<script setup lang="ts">
import { computed, ref } from "vue";
import { AppIcon } from "./index";
import type { SelectOption } from "./types";

/** Listbox — single/multiple selection from a (filterable) list. */

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
</script>

<template>
  <div class="listbox" role="listbox" :aria-multiselectable="multiple || undefined">
    <div v-if="filter" class="listbox__search">
      <AppIcon name="search" :size="13" />
      <input v-model="q" type="text" :placeholder="placeholder" />
    </div>
    <ul class="listbox__items">
      <li
        v-for="o in filtered"
        :key="o.value"
        class="listbox__item"
        :class="{ 'is-selected': isSel(o), 'is-disabled': o.disabled }"
        role="option"
        :aria-selected="isSel(o)"
        @click="onPick(o)"
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
