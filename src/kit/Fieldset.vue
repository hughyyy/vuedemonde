<script setup lang="ts">
import { useId } from "vue";
import { AppIcon } from "./index";

/** Fieldset — grouped container with a legend; optionally collapsible. */

withDefaults(
  defineProps<{
    legend: string;
    toggleable?: boolean;
    open?: boolean;
  }>(),
  { toggleable: false, open: true },
);

const emit = defineEmits<{ "update:open": [v: boolean] }>();
const bodyId = useId();
</script>

<template>
  <div class="fieldset">
    <div class="fieldset__legend">
      <button
        v-if="toggleable"
        class="fieldset__toggle"
        type="button"
        :aria-expanded="open"
        :aria-controls="bodyId"
        @click="emit('update:open', !open)"
      >
        <AppIcon name="chevron-down" :size="13" class="fieldset__chevron" :class="{ 'is-open': open }" />
        {{ legend }}
      </button>
      <span v-else class="fieldset__legend-text">{{ legend }}</span>
    </div>
    <div :id="bodyId" v-show="open" class="fieldset__body"><slot /></div>
  </div>
</template>

<style scoped>
.fieldset {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  min-width: 0;
}
.fieldset__legend {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--divider);
}
.fieldset__legend-text,
.fieldset__toggle {
  font: 600 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.fieldset__toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}
.fieldset__toggle:hover {
  color: var(--text);
}
.fieldset__chevron {
  transition: transform var(--dur-2) var(--ease-out);
  color: var(--text-3);
}
.fieldset__chevron.is-open {
  transform: rotate(180deg);
}
.fieldset__body {
  padding: var(--space-3);
}
</style>
