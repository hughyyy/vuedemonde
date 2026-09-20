<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    label?: string;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

function onInput(e: Event): void {
  emit("update:modelValue", (e.target as HTMLInputElement).checked);
}
</script>

<template>
  <label class="app-toggle" :class="{ 'is-disabled': disabled }">
    <input
      class="app-toggle__box"
      type="checkbox"
      role="switch"
      :checked="modelValue"
      :disabled="disabled"
      @input="onInput"
    />
    <span v-if="label" class="app-toggle__label">{{ label }}</span>
    <slot />
  </label>
</template>

<style scoped>
.app-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font: 400 var(--fs-13)/1.4 var(--font-body);
  color: var(--text);
}
.app-toggle.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.app-toggle__box {
  position: relative;
  width: 34px;
  height: 18px;
  margin: 0;
  appearance: none;
  border-radius: var(--radius-pill);
  background: var(--surface-3);
  border: 1px solid var(--line-strong);
  transition: background var(--dur-2) var(--ease-in-out), border-color var(--dur-2) var(--ease-in-out);
  cursor: pointer;
}
.app-toggle__box::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: var(--radius-pill);
  background: var(--text-2);
  transition: transform var(--dur-2) var(--ease-in-out), background var(--dur-2) var(--ease-in-out);
}
.app-toggle__box:checked {
  background: var(--accent-gradient);
  border-color: transparent;
}
.app-toggle__box:checked::after {
  transform: translateX(16px);
  background: var(--accent-ink);
}
</style>
