<script setup lang="ts">
/** InputGroup — visually joins several controls into one field (left/right slots). */
</script>

<template>
  <div class="input-group">
    <span v-if="$slots.left" class="input-group__addon"><slot name="left" /></span>
    <span class="input-group__main"><slot /></span>
    <span v-if="$slots.right" class="input-group__addon"><slot name="right" /></span>
  </div>
</template>

<style scoped>
.input-group {
  display: inline-flex;
  align-items: stretch;
  min-width: 0;
}
.input-group > * {
  border-radius: 0;
}
.input-group > :first-child {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}
.input-group > :last-child {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.input-group__main {
  display: inline-flex;
  flex: 1;
  min-width: 0;
}
.input-group__main :deep(> *) {
  border-radius: 0;
}
.input-group__addon {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--space-2);
  border: 1px solid var(--line);
  border-left: none;
  background: var(--surface-2);
  color: var(--text-2);
  font: 400 var(--fs-13)/1.4 var(--font-body);
  white-space: nowrap;
}
.input-group__addon:first-child {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  border-left: 1px solid var(--line);
}
.input-group__addon:last-child {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
</style>
