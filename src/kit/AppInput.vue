<script setup lang="ts">
import { useId } from "vue";
withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    placeholder?: string;
    type?: "text" | "number" | "password" | "email";
    hint?: string;
    error?: string;
    size?: "sm" | "md";
    disabled?: boolean;
  }>(),
  {
    type: "text",
    size: "md",
    disabled: false,
  },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const msgId = useId();

function onInput(e: Event): void {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
}
</script>

<template>
  <label class="app-input" :class="[{ 'has-error': !!error, [`is-${size}`]: true }]">
    <span v-if="label" class="app-input__label">{{ label }}</span>
    <input
      class="app-input__control"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error || hint ? msgId : undefined"
      @input="onInput"
    />
    <span v-if="error" :id="msgId" class="app-input__msg is-error" role="alert">{{ error }}</span>
    <span v-else-if="hint" :id="msgId" class="app-input__msg">{{ hint }}</span>
  </label>
</template>

<style scoped>
.app-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}
.app-input__label {
  font: 500 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-2);
}
.app-input__control {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text);
  font: 400 var(--fs-14)/1.4 var(--font-body);
  transition: border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
}
.app-input.is-sm .app-input__control {
  padding: var(--space-1) var(--space-2);
  font-size: var(--fs-13);
}
.app-input__control::placeholder {
  color: var(--text-3);
}
.app-input__control:hover:not(:disabled) {
  border-color: var(--line-strong);
}
.app-input__control:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.app-input.has-error .app-input__control {
  border-color: var(--err);
}
.app-input__control:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring);
  outline-offset: 1px;
}
.app-input.has-error .app-input__control:focus-visible {
  outline-color: var(--err);
}
.app-input__msg {
  font: 400 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-3);
}
.app-input__msg.is-error {
  color: var(--err);
}
</style>
