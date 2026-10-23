<script setup lang="ts">
/**
 * Single-component print page for the release renderer.
 *
 * `?print=component&id=<Component>&theme=<theme>` renders exactly one catalogue
 * demo, with the theme applied to `<html>` before paint so TELEPORTED panels
 * (dialog/drawer/popover/toast) inherit the right tokens — they escape to
 * `<body>`, so a `data-theme` island around the demo would NOT theme them.
 * That is why the renderer does one page load per theme and stitches the
 * crops, rather than putting six theme islands on one page
 * (docs/per-component-rendering.md §2).
 *
 * Height: teleported modals are `position: fixed` centred in the viewport, so
 * a short demo would let the panel land OUTSIDE the captured element band.
 * `--shot-min-height` keeps every cell tall enough that a centred modal stays
 * in frame; the renderer screenshots `#component-shot` and pads to that height.
 */
import { computed, onMounted } from "vue";
import "./catalogue/catalogue.css";

const props = defineProps<{
  /** Registry id (the exported component name). */
  id: string;
  /** Theme already applied to `<html>` by App.vue. */
  theme: string;
  entry: { label: string; demo: unknown; wide?: boolean; shot?: number };
}>();

const width = computed(() => props.entry.shot ?? (props.entry.wide ? 780 : 520));

onMounted(() => {
  document.documentElement.dataset.print = "";
});
</script>

<template>
  <div
    id="component-shot"
    class="cat-shot"
    :data-component="id"
    :style="{ width: `${width}px`, minHeight: '640px' }"
  >
    <div class="cat-shot__head">
      <span class="cat-shot__name">{{ entry.label }}</span>
      <span class="cat-shot__theme">{{ theme }}</span>
    </div>
    <div class="cat-shot__body">
      <component :is="entry.demo" print />
    </div>
  </div>
</template>

<style scoped>
/* The shot is the screenshot target: a fixed width makes all six theme crops
 * identical in size, so the composite grid aligns without per-theme fixes. */
.cat-shot {
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text);
  padding: 16px;
  box-sizing: border-box;
}
.cat-shot__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--divider);
}
.cat-shot__name {
  font-size: var(--fs-14);
  font-weight: var(--fw-600);
}
.cat-shot__theme {
  font-family: var(--font-mono);
  font-size: var(--fs-12);
  color: var(--text-3);
}
.cat-shot__body {
  flex: 1;
}
</style>
