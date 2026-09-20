<script setup lang="ts">
import AppIcon from "./AppIcon.vue";

withDefaults(
  defineProps<{
    modelValue: boolean;
    label?: string;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{ "update:modelValue": [v: boolean] }>();
</script>

<template>
  <button
    class="toggle-button"
    :class="{ 'is-active': modelValue }"
    type="button"
    :aria-pressed="modelValue"
    :disabled="disabled"
    @click="emit('update:modelValue', !modelValue)"
  >
    <AppIcon v-if="modelValue" name="check" :size="12" class="toggle-button__check" />
    <span v-if="label" class="toggle-button__label">{{ label }}</span>
  </button>
</template>

<style scoped>
.toggle-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text-2);
  font: 500 var(--fs-13)/1.6 var(--font-body);
  cursor: pointer;
  transition: background var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out);
}
.toggle-button:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text);
}
.toggle-button.is-active {
  background: var(--accent-soft);
  border-color: transparent;
  color: var(--accent);
}
.toggle-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.toggle-button__check {
  flex: none;
}
</style>
