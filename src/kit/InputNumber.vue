<script setup lang="ts">
import { computed } from "vue";
import { AppIcon } from "./index";

/** InputNumber — numeric field with steppers (native spinners hidden). */

const props = withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
  }>(),
  { min: 0, max: 1_000_000, step: 1, disabled: false },
);

const emit = defineEmits<{ "update:modelValue": [v: number] }>();

const text = computed(() => String(props.modelValue));

function clamp(v: number): number {
  return Math.min(props.max, Math.max(props.min, v));
}

function nudge(dir: 1 | -1): void {
  emit("update:modelValue", clamp(props.modelValue + dir * props.step));
}

function onInput(e: Event): void {
  const v = Number((e.target as HTMLInputElement).value);
  if (!Number.isNaN(v)) emit("update:modelValue", clamp(v));
}
</script>

<template>
  <div class="input-number" :class="{ 'is-disabled': disabled }">
    <input
      class="input-number__field"
      type="number"
      :value="text"
      :disabled="disabled"
      :min="min"
      :max="max"
      :step="step"
      @input="onInput"
    />
    <div class="input-number__steppers">
      <button type="button" aria-label="Increment" :disabled="disabled || modelValue >= max" @click="nudge(1)">
        <AppIcon name="chevron-up" :size="11" />
      </button>
      <button type="button" aria-label="Decrement" :disabled="disabled || modelValue <= min" @click="nudge(-1)">
        <AppIcon name="chevron-down" :size="11" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-number {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  overflow: hidden;
  transition: border-color var(--dur-1) var(--ease-out);
}
.input-number:focus-within {
  border-color: var(--line-strong);
}
.input-number.is-disabled {
  opacity: 0.5;
}
.input-number__field {
  flex: 1;
  width: 96px;
  padding: var(--space-2) var(--space-1) var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-14)/1.4 var(--font-body);
  appearance: textfield;
  font-variant-numeric: tabular-nums;
}
.input-number__field::-webkit-outer-spin-button,
.input-number__field::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}
.input-number__field:focus {
  outline: none;
}
.input-number__steppers {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--divider);
}
.input-number__steppers button {
  display: grid;
  place-items: center;
  flex: 1;
  width: 22px;
  border: none;
  background: var(--surface-2);
  color: var(--text-2);
  cursor: pointer;
}
.input-number__steppers button:first-child {
  border-bottom: 1px solid var(--divider);
}
.input-number__steppers button:hover:not(:disabled) {
  background: var(--surface-3);
  color: var(--text);
}
.input-number__steppers button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
