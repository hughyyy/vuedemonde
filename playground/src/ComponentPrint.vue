<script setup lang="ts">
/**
 * Single-component print page for the release renderer.
 *
 * `?print=component&id=<Component>&theme=<theme>` renders exactly one catalogue
 * demo, with the theme applied to `<html>` before paint so TELEPORTED panels
 * (dialog/drawer/popover/toast) inherit the right tokens — they escape to
 * `<body>`, so a `data-theme` island around the demo would NOT theme them.
 * That is why the renderer does one page load per theme and stitches the
 * crops (docs/per-component-rendering.md §2).
 *
 * There is deliberately NO fixed height and NO per-cell header here: the
 * renderer measures the painted content and crops to it, so a badge demo does
 * not ship the same 3× oversized empty panel as a calendar. Theme labels are
 * drawn into the composite, not the page.
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

/** Layout width the demo is given; capture width is measured from content. */
const width = computed(() => props.entry.shot ?? (props.entry.wide ? 780 : 520));

onMounted(() => {
  document.documentElement.dataset.print = "";
});
</script>

<template>
  <div id="component-shot" class="cat-shot" :data-component="id" :style="{ width: `${width}px` }">
    <component :is="entry.demo" print />
  </div>
</template>

<style scoped>
/* Width is fixed (so wide demos lay out consistently); HEIGHT is content-
 * driven — the renderer crops to the painted box, never to a fixed panel. */
.cat-shot {
  display: block;
  background: var(--bg);
  color: var(--text);
  padding: 12px;
  box-sizing: border-box;
}
</style>
