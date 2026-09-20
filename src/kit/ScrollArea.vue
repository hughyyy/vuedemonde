<script setup lang="ts">
/** ScrollArea — scrollable region with the kit's themed scrollbar. */

withDefaults(
  defineProps<{
    maxHeight?: string;
  }>(),
  {},
);
</script>

<template>
  <div class="scroll-area" :style="maxHeight ? { maxHeight } : undefined"><slot /></div>
</template>

<style scoped>
.scroll-area {
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-3) transparent;
}
.scroll-area::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.scroll-area::-webkit-scrollbar-thumb {
  background: var(--surface-3);
  border-radius: var(--radius-pill);
  border: 2px solid transparent;
  background-clip: padding-box;
}
.scroll-area::-webkit-scrollbar-thumb:hover {
  background: var(--line-strong);
  border: 2px solid transparent;
  background-clip: padding-box;
}
.scroll-area::-webkit-scrollbar-track {
  background: transparent;
}
</style>
