<script setup lang="ts">
/** Fluid — makes descendant form controls full-width and stacked. */
</script>

<template>
  <div class="fluid"><slot /></div>
</template>

<style scoped>
.fluid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}
.fluid :deep(> *) {
  width: 100%;
}
</style>
