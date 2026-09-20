<script setup lang="ts">
import AppIcon from "./AppIcon.vue";
import type { AccordionItem } from "./types";

const props = withDefaults(
  defineProps<{
    items: AccordionItem[];
    /** currently-open item id (single-expand); null = all closed */
    modelValue: string | null;
  }>(),
  { modelValue: null },
);

const emit = defineEmits<{ "update:modelValue": [value: string | null] }>();

function toggle(id: string): void {
  emit("update:modelValue", props.modelValue === id ? null : id);
}
</script>

<template>
  <div class="app-accordion">
    <div v-for="item in items" :key="item.id" class="app-accordion__item"
      :class="{ 'is-open': modelValue === item.id }">
      <button
        class="app-accordion__head"
        type="button"
        :aria-expanded="modelValue === item.id"
        @click="toggle(item.id)"
      >
        <span class="app-accordion__title">{{ item.title }}</span>
        <AppIcon name="chevron-down" :size="14" class="app-accordion__chevron" />
      </button>
      <div v-show="modelValue === item.id" class="app-accordion__body">
        <slot :name="`panel-${item.id}`" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-accordion {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.app-accordion__item {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  overflow: hidden;
}
.app-accordion__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  color: var(--text);
  font: 500 var(--fs-13)/1.4 var(--font-body);
  cursor: pointer;
  text-align: left;
}
.app-accordion__head:hover {
  background: var(--surface-2);
}
.app-accordion__chevron {
  color: var(--text-3);
  transition: transform var(--dur-2) var(--ease-out);
}
.app-accordion__item.is-open .app-accordion__chevron {
  transform: rotate(180deg);
}
.app-accordion__body {
  padding: var(--space-3);
  border-top: 1px solid var(--divider);
}
</style>
