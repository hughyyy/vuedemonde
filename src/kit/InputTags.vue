<script setup lang="ts">
import { ref } from "vue";
import { AppIcon } from "./index";

/** InputTags — chip editor: Enter/comma adds, X removes, Backspace on empty pops. */

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    placeholder?: string;
    disabled?: boolean;
    /** accessible name for the tag input (placeholder disappears once tags exist). */
    ariaLabel?: string;
  }>(),
  { placeholder: "Add tag…", disabled: false, ariaLabel: "Add tag" },
);

const emit = defineEmits<{ "update:modelValue": [v: string[]] }>();

const draft = ref("");

function commit(): void {
  const t = draft.value.trim();
  if (t) emit("update:modelValue", [...props.modelValue, t]);
  draft.value = "";
}

function remove(i: number): void {
  emit("update:modelValue", props.modelValue.filter((_, x) => x !== i));
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    commit();
  } else if (e.key === "Backspace" && !draft.value && props.modelValue.length) {
    remove(props.modelValue.length - 1);
  }
}
</script>

<template>
  <div class="input-tags" :class="{ 'is-disabled': disabled }">
    <span v-for="(t, i) in modelValue" :key="`${t}-${i}`" class="input-tags__chip">
      {{ t }}
      <button type="button" :aria-label="`Remove ${t}`" @click="remove(i)">
        <AppIcon name="close" :size="10" />
      </button>
    </span>
    <input
      v-model="draft"
      class="input-tags__input"
      type="text"
      :placeholder="modelValue.length ? '' : placeholder"
      :disabled="disabled"
      :aria-label="ariaLabel"
      @keydown="onKeydown"
    />
  </div>
</template>

<style scoped>
.input-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
  min-height: 38px;
  padding: var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  cursor: text;
}
.input-tags:focus-within {
  border-color: var(--line-strong);
}
.input-tags.is-disabled {
  opacity: 0.5;
}
.input-tags__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  font: 500 var(--fs-12)/1.5 var(--font-body);
}
.input-tags__chip button {
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: none;
  background: transparent;
  color: currentColor;
  opacity: 0.8;
  cursor: pointer;
}
.input-tags__chip button:hover {
  opacity: 1;
}
.input-tags__input {
  flex: 1;
  min-width: 80px;
  padding: var(--space-1);
  border: none;
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-13)/1.5 var(--font-body);
}
.input-tags__input:focus {
  outline: none;
}
.input-tags__input::placeholder {
  color: var(--text-3);
}
</style>
