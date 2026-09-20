<script setup lang="ts">
import type { SelectOption } from "./types";

withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

function onInput(e: Event): void {
  emit("update:modelValue", (e.target as HTMLSelectElement).value);
}
</script>

<template>
  <label class="app-select" :class="{ 'has-error': !!error }">
    <span v-if="label" class="app-select__label">{{ label }}</span>
    <div class="app-select__wrap">
      <select
        class="app-select__control"
        :value="modelValue"
        :disabled="disabled"
        :aria-invalid="!!error"
        @change="onInput"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="o in options" :key="o.value" :value="o.value" :disabled="o.disabled">
          {{ o.label }}
        </option>
      </select>
      <svg class="app-select__chevron" viewBox="0 0 24 24" width="14" height="14" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
    <span v-if="error" class="app-select__msg is-error" role="alert">{{ error }}</span>
  </label>
</template>

<style scoped>
.app-select {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}
.app-select__label {
  font: 500 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-2);
}
.app-select__wrap {
  position: relative;
}
.app-select__control {
  width: 100%;
  appearance: none;
  padding: var(--space-2) var(--space-6) var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text);
  font: 400 var(--fs-14)/1.4 var(--font-body);
  cursor: pointer;
  transition: border-color var(--dur-1) var(--ease-out);
}
.app-select__control:hover:not(:disabled) {
  border-color: var(--line-strong);
}
.app-select__control:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.app-select__chevron {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-3);
  pointer-events: none;
}
.app-select.has-error .app-select__control {
  border-color: var(--err);
}
.app-select__msg {
  font: 400 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-3);
}
.app-select__msg.is-error {
  color: var(--err);
}
</style>
