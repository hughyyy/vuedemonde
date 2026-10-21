<script setup lang="ts">
import { useId } from "vue";
import type { RadioOption } from "./types";

withDefaults(
  defineProps<{
    modelValue: string;
    options: RadioOption[];
    label?: string;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
/** unique group name per instance — two radio groups must never share it */
const groupName = useId();

function onInput(e: Event): void {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
}
</script>

<template>
  <fieldset class="app-radio" :disabled="disabled">
    <legend v-if="label" class="app-radio__label">{{ label }}</legend>
    <div class="app-radio__row">
      <label v-for="o in options" :key="o.value" class="app-radio__item">
        <input
          class="app-radio__dot"
          type="radio"
          :value="o.value"
          :checked="modelValue === o.value"
          :disabled="o.disabled"
          :name="groupName"
          @input="onInput"
        />
        <span>{{ o.label }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.app-radio {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.app-radio__label {
  font: 500 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-2);
}
.app-radio__row {
  display: flex;
  gap: var(--space-4);
}
.app-radio__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font: 400 var(--fs-13)/1.4 var(--font-body);
  color: var(--text);
}
.app-radio__dot {
  width: 16px;
  height: 16px;
  margin: 0;
  appearance: none;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background: var(--surface-1);
  display: grid;
  place-content: center;
  transition: border-color var(--dur-1) var(--ease-out);
}
.app-radio__dot::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
  transform: scale(0);
  transition: transform var(--dur-1) var(--ease-out);
  background: var(--accent);
}
.app-radio__dot:checked {
  border-color: var(--accent);
}
.app-radio__dot:checked::before {
  transform: scale(1);
}
.app-radio:disabled .app-radio__item {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
