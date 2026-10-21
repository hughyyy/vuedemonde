<script setup lang="ts">
import { useId } from "vue";
withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    placeholder?: string;
    hint?: string;
    error?: string;
    rows?: number;
    mono?: boolean;
    disabled?: boolean;
  }>(),
  { rows: 4, mono: false, disabled: false },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const msgId = useId();

function onInput(e: Event): void {
  emit("update:modelValue", (e.target as HTMLTextAreaElement).value);
}
</script>

<template>
  <label class="app-textarea" :class="{ 'has-error': !!error, 'is-mono': mono }">
    <span v-if="label" class="app-textarea__label">{{ label }}</span>
    <textarea
      class="app-textarea__control"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error || hint ? msgId : undefined"
      @input="onInput"
    />
    <span v-if="error" :id="msgId" class="app-textarea__msg is-error" role="alert">{{ error }}</span>
    <span v-else-if="hint" :id="msgId" class="app-textarea__msg">{{ hint }}</span>
  </label>
</template>

<style scoped>
.app-textarea {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}
.app-textarea__label {
  font: 500 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-2);
}
.app-textarea__control {
  width: 100%;
  resize: vertical;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text);
  font: 400 var(--fs-13)/1.5 var(--font-body);
  transition: border-color var(--dur-1) var(--ease-out);
}
.is-mono .app-textarea__control {
  font-family: var(--font-mono);
}
.app-textarea__control::placeholder {
  color: var(--text-3);
}
.app-textarea__control:hover:not(:disabled) {
  border-color: var(--line-strong);
}
.app-textarea__control:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.app-textarea.has-error .app-textarea__control {
  border-color: var(--err);
}
.app-textarea__control:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring);
  outline-offset: 1px;
}
.app-textarea.has-error .app-textarea__control:focus-visible {
  outline-color: var(--err);
}
.app-textarea__msg {
  font: 400 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-3);
}
.app-textarea__msg.is-error {
  color: var(--err);
}
</style>
