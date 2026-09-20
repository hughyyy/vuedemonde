<script setup lang="ts">
import type { SelectOption } from "./types";

const props = withDefaults(
  defineProps<{
    options: SelectOption[];
    modelValue: string | string[];
    multiple?: boolean;
  }>(),
  { multiple: false },
);

const emit = defineEmits<{ "update:modelValue": [v: string | string[]] }>();

function isActive(o: SelectOption): boolean {
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
  <div class="select-button" role="group">
    <button
      v-for="o in options"
      :key="o.value"
      class="select-button__item"
      :class="{ 'is-active': isActive(o), 'is-disabled': o.disabled }"
      type="button"
      :aria-pressed="isActive(o)"
      :disabled="o.disabled"
      @click="onPick(o)"
    >
      {{ o.label }}
    </button>
  </div>
</template>

<style scoped>
.select-button {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
}
.select-button__item {
  padding: var(--space-1) var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  font: 500 var(--fs-13)/1.6 var(--font-body);
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out);
}
.select-button__item:hover:not(:disabled) {
  color: var(--text);
}
.select-button__item.is-active {
  background: var(--accent-soft);
  color: var(--accent);
}
.select-button__item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
