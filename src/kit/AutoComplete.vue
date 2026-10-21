<script setup lang="ts">
import { computed, ref, useId } from "vue";
/**
 * AutoComplete — text input with a filtered suggestion dropdown. Suggests from
 * `suggestions` when they match the typed value. Keyboard: ↓/↑ move through
 * suggestions (aria-activedescendant), Enter picks, Escape closes.
 */
const props = withDefaults(
  defineProps<{
    modelValue: string;
    suggestions: string[];
    placeholder?: string;
    /** accessible name for the input. */
    ariaLabel?: string;
  }>(),
  { placeholder: "", ariaLabel: "Suggestions" },
);
const emit = defineEmits<{
  "update:modelValue": [v: string];
  select: [v: string];
}>();
const open = ref(false);
const active = ref<number | null>(null);
const listId = useId();
const filtered = computed(() => {
  const s = props.modelValue.trim().toLowerCase();
  if (!s) return props.suggestions.slice(0, 8);
  return props.suggestions.filter((x) => x.toLowerCase().includes(s)).slice(0, 8);
});
function onInput(e: Event): void {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
  active.value = null;
  open.value = true;
}
function pick(s: string): void {
  emit("update:modelValue", s);
  emit("select", s);
  open.value = false;
}
function onKeydown(e: KeyboardEvent): void {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const n = filtered.value.length;
    if (!n) return;
    const dir = e.key === "ArrowDown" ? 1 : -1;
    active.value = active.value === null ? (dir === 1 ? 0 : n - 1) : (active.value + dir + n) % n;
  } else if (e.key === "Enter") {
    e.preventDefault();
    const s = active.value !== null ? filtered.value[active.value] : filtered.value[0];
    if (s) pick(s);
  } else if (e.key === "Escape") {
    open.value = false;
  }
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
      :aria-label="ariaLabel"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="open && filtered.length > 0"
      :aria-controls="listId"
      :aria-activedescendant="active === null ? undefined : `${listId}-opt-${active}`"
      @input="onInput"
      @focus="open = true"
      @blur="onBlur"
      @keydown="onKeydown"
    />
    <div v-if="open && filtered.length" :id="listId" class="autocomplete__list" role="listbox">
      <button
        v-for="(s, i) in filtered"
        :key="s"
        :id="`${listId}-opt-${i}`"
        class="autocomplete__item"
        :class="{ 'is-active': active === i }"
        type="button"
        role="option"
        @mousedown.prevent
        @click="pick(s)"
        @mouseenter="active = i"
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
.autocomplete__item.is-active,
.autocomplete__item:hover {
  background: var(--surface-3);
}
</style>
