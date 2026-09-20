<script setup lang="ts">
import { computed, ref } from "vue";

/**
 * AutoComplete — text input with a filtered suggestion dropdown. Suggests from
 * `suggestions` when they match the typed value.
 */

const props = withDefaults(
  defineProps<{
    modelValue: string;
    suggestions: string[];
    placeholder?: string;
  }>(),
  { placeholder: "" },
);

const emit = defineEmits<{
  "update:modelValue": [v: string];
  select: [v: string];
}>();

const open = ref(false);

const filtered = computed(() => {
  const s = props.modelValue.trim().toLowerCase();
  if (!s) return props.suggestions.slice(0, 8);
  return props.suggestions.filter((x) => x.toLowerCase().includes(s)).slice(0, 8);
});

function onInput(e: Event): void {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
  open.value = true;
}

function pick(s: string): void {
  emit("update:modelValue", s);
  emit("select", s);
  open.value = false;
}

function onBlur(): void {
  window.setTimeout(() => (open.value = false), 140);
}
</script>

<template>
  <div class="autocomplete">
    <input
      class="autocomplete__input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
      @focus="open = true"
      @blur="onBlur"
      @keydown.enter.prevent="filtered[0] && pick(filtered[0])"
    />
    <div v-if="open && filtered.length" class="autocomplete__list" role="listbox">
      <button
        v-for="s in filtered"
        :key="s"
        class="autocomplete__item"
        type="button"
        role="option"
        @mousedown.prevent
        @click="pick(s)"
      >
        {{ s }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.autocomplete {
  position: relative;
  min-width: 200px;
}
.autocomplete__input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text);
  font: 400 var(--fs-14)/1.4 var(--font-body);
  transition: border-color var(--dur-1) var(--ease-out);
}
.autocomplete__input:focus {
  outline: none;
  border-color: var(--line-strong);
}
.autocomplete__input::placeholder {
  color: var(--text-3);
}
.autocomplete__list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 60;
  max-height: 220px;
  overflow-y: auto;
  padding: var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-overlay);
}
.autocomplete__item {
  display: block;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-13)/1.4 var(--font-body);
  text-align: left;
  cursor: pointer;
}
.autocomplete__item:hover {
  background: var(--surface-2);
}
</style>
