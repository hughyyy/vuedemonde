<script setup lang="ts">
import { AppIcon } from "./index";
import type { BreadcrumbItem } from "./types";

withDefaults(
  defineProps<{
    items: BreadcrumbItem[];
  }>(),
  {},
);

const emit = defineEmits<{ select: [id: string] }>();
</script>

<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <template v-for="(it, i) in items" :key="it.id">
      <button
        v-if="i < items.length - 1"
        class="breadcrumb__link"
        type="button"
        @click="emit('select', it.id)"
      >
        {{ it.label }}
      </button>
      <span v-else class="breadcrumb__current" aria-current="page">{{ it.label }}</span>
      <AppIcon v-if="i < items.length - 1" name="chevron-right" :size="12" class="breadcrumb__sep" />
    </template>
  </nav>
</template>

<style scoped>
.breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font: 400 var(--fs-13)/1.6 var(--font-body);
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
}
.breadcrumb__link {
  padding: 0 1px;
  border: none;
  background: transparent;
  color: var(--text-3);
  font: inherit;
  cursor: pointer;
  white-space: nowrap;
}
.breadcrumb__link:hover {
  color: var(--accent);
  text-decoration: underline;
}
.breadcrumb__current {
  color: var(--text);
  font-weight: var(--fw-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.breadcrumb__sep {
  color: var(--text-3);
  flex: none;
}
</style>
