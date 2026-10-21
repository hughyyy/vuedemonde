<script setup lang="ts">
/** Search input — a text field with a trailing clear (×) button.
 *
 * Kit atom on the `AppInput` design tokens (AppInput.vue): same control chrome,
 * but the value has a one-click clear affordance (an `x` on the right) — used
 * by the Jira-lite search bar and by filter-dropdown text boxes. Built as a
 * shared component + a Gallery demo so every "input with clear" surface reuses
 * it instead of hand-rolled clears. */
import { ref } from "vue";
import AppIcon from "./AppIcon.vue";

withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    placeholder?: string;
    /** Compact variant for panels/dropdowns (default md = full size). */
    size?: "sm" | "md";
    /** Input aria-label when there's no visible label. */
    ariaLabel?: string;
    /** Clear-button aria-label prefix. */
    clearLabel?: string;
    disabled?: boolean;
  }>(),
  { size: "md", clearLabel: "Clear", disabled: false },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const inputEl = ref<HTMLInputElement | null>(null);

function onInput(e: Event): void {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
}

function clear(): void {
  emit("update:modelValue", "");
  inputEl.value?.focus();
}
</script>

<template>
  <label class="app-search" :class="[`is-${size}`, { 'is-disabled': disabled }]">
    <span v-if="label" class="app-search__label">{{ label }}</span>
    <span class="app-search__wrap">
      <input
        ref="inputEl"
        class="app-search__control"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="ariaLabel"
        @input="onInput"
      />
      <button
        v-if="modelValue"
        type="button"
        class="app-search__clear"
        :aria-label="`${clearLabel}: clear ${(ariaLabel ?? label ?? 'input').toLowerCase()}`"
        :disabled="disabled"
        @click="clear"
      >
        <AppIcon name="close" :size="12" />
      </button>
    </span>
  </label>
</template>

<style scoped>
.app-search {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}
.app-search__label {
  font: 500 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-2);
}
.app-search__wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.app-search__control {
  width: 100%;
  padding: var(--space-2) var(--space-6) var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text);
  font: 400 var(--fs-14)/1.4 var(--font-body);
  transition: border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
}
.app-search.is-sm .app-search__control {
  padding: var(--space-1) var(--space-6) var(--space-1) var(--space-3);
  font-size: var(--fs-13);
}
.app-search__control::placeholder {
  color: var(--text-3);
}
.app-search__control:hover:not(:disabled) {
  border-color: var(--line-strong);
}
.app-search__control:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.app-search__clear {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  transition: background var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out);
}
.app-search__clear:hover:not(:disabled) {
  color: var(--text);
  background: var(--nav-hover-bg);
}
.app-search__clear:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.app-search.is-disabled {
  opacity: 0.55;
}
</style>
