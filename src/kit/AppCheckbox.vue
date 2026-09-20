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
  <label class="app-checkbox" :class="{ 'is-disabled': disabled }">
    <input
      class="app-checkbox__box"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @input="onInput"
    />
    <span v-if="label" class="app-checkbox__label">{{ label }}</span>
    <slot />
  </label>
</template>

<style scoped>
.app-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font: 400 var(--fs-13)/1.4 var(--font-body);
  color: var(--text);
}
.app-checkbox.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.app-checkbox__box {
  width: 16px;
  height: 16px;
  margin: 0;
  appearance: none;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-xs);
  background: var(--surface-1);
  display: grid;
  place-content: center;
  transition: background var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out);
}
.app-checkbox__box::before {
  content: "";
  width: 10px;
  height: 10px;
  transform: scale(0);
  transition: transform var(--dur-1) var(--ease-out);
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  background: var(--accent-ink);
}
.app-checkbox__box:checked {
  background: var(--accent-gradient);
  border-color: transparent;
}
.app-checkbox__box:checked::before {
  transform: scale(1);
}
</style>
