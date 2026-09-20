<script setup lang="ts">
/** Toolbar — generic grouped bar with left / center / right slots. */

withDefaults(
  defineProps<{
    title?: string;
  }>(),
  { title: "" },
);
</script>

<template>
  <div class="app-toolbar">
    <div class="app-toolbar__left">
      <h2 v-if="title" class="app-toolbar__title">{{ title }}</h2>
      <slot name="left" />
    </div>
    <div class="app-toolbar__center"><slot name="center" /></div>
    <div class="app-toolbar__right"><slot name="right" /></div>
  </div>
</template>

<style scoped>
.app-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
}
.app-toolbar__left,
.app-toolbar__center,
.app-toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}
.app-toolbar__center {
  flex: 1;
  justify-content: center;
}
.app-toolbar__title {
  margin: 0;
  font: 600 var(--fs-14)/1.4 var(--font-body);
  color: var(--text);
  white-space: nowrap;
}
</style>
