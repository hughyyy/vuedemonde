<script setup lang="ts">
/** Option input — a text field (with clear ×) plus a list of KNOWN clickable
 * options below, filtered live as you type.
 *
 * Kit atom for "I know some possible values, but the user may also type their
 * own": the search box is always first; known options render underneath and
 * clicking one fills the box. Emits `update:modelValue` on every change and an
 * extra `pick` when a KNOWN option is clicked (so a screen can, e.g., close the
 * dropdown — a free-text keystroke should not). Used by the Jira-lite filter
 * dropdowns (Assignee / Project / Team) against values derived from the search
 * result set. */
import { computed } from "vue";
import AppSearchInput from "./AppSearchInput.vue";

export type AppOption = { value: string; label?: string; hint?: string };

const props = withDefaults(
  defineProps<{
    modelValue: string;
    /** Known selectable values (shown below the search box, filtered by the text). */
    options: AppOption[];
    label?: string;
    placeholder?: string;
    size?: "sm" | "md";
    ariaLabel?: string;
    clearLabel?: string;
    disabled?: boolean;
    /** Max known options to render (default 50). */
    max?: number;
    /** Hidden when every option is present. */
    emptyLabel?: string;
  }>(),
  { size: "md", max: 50, emptyLabel: "No matching options" },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  /** A known option was clicked (not a free-text keystroke). */
  pick: [value: string];
}>();

const filtered = computed(() => {
  const q = props.modelValue.trim().toLowerCase();
  const list = props.options.filter((o) => {
    if (!q) return true;
    return `${o.label ?? ""} ${o.value} ${o.hint ?? ""}`.toLowerCase().includes(q);
  });
  return list.slice(0, props.max);
});
</script>

<template>
  <div class="app-opts">
    <AppSearchInput
      :model-value="modelValue"
      :label="label"
      :placeholder="placeholder"
      :size="size"
      :aria-label="ariaLabel"
      :clear-label="clearLabel"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <div v-if="filtered.length" class="app-opts__list">
      <button
        v-for="o in filtered"
        :key="o.value"
        type="button"
        class="app-opts__opt"
        :class="{ on: o.value === modelValue }"
        @click="emit('pick', o.value); emit('update:modelValue', o.value)"
      >
        <span class="app-opts__label">{{ o.label ?? o.value }}</span>
        <span v-if="o.hint" class="app-opts__hint">{{ o.hint }}</span>
      </button>
    </div>
    <p v-else-if="options.length" class="app-opts__none">{{ emptyLabel }}</p>
  </div>
</template>

<style scoped>
.app-opts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}
.app-opts__list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  max-height: 200px;
  overflow-y: auto;
}
.app-opts__opt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-1) var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  font: 400 var(--fs-13)/1.4 var(--font-body);
  text-align: left;
  cursor: pointer;
}
.app-opts__opt:hover,
.app-opts__opt:focus-visible {
  background: var(--nav-hover-bg);
  color: var(--text);
}
.app-opts__opt.on {
  color: var(--accent);
  font-weight: var(--fw-600, 600);
}
.app-opts__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.app-opts__hint {
  flex: none;
  color: var(--text-3);
  font-size: var(--fs-11);
}
.app-opts__none {
  margin: 0;
  color: var(--text-3);
  font-size: var(--fs-12);
}
</style>
