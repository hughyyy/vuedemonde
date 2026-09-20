<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

/**
 * Splitter — resizable two-pane split (side-by-side or stacked) with a
 * draggable gutter. First pane size = `modelValue` fraction (0–1) when bound.
 */

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    orientation?: "horizontal" | "vertical";
  }>(),
  { orientation: "horizontal" },
);

const emit = defineEmits<{ "update:modelValue": [v: number] }>();

const size = ref(Math.min(0.9, Math.max(0.1, props.modelValue ?? 0.5)));
const gutterEl = ref<HTMLElement | null>(null);

let dragging = false;

function setSize(v: number): void {
  size.value = Math.min(0.9, Math.max(0.1, v));
  if (props.modelValue !== undefined) emit("update:modelValue", size.value);
}

function onDown(e: PointerEvent): void {
  dragging = true;
  gutterEl.value?.setPointerCapture(e.pointerId);
}

function onMove(e: PointerEvent): void {
  if (!dragging) return;
  const host = gutterEl.value?.parentElement;
  if (!host) return;
  const r = host.getBoundingClientRect();
  const frac = props.orientation === "horizontal" ? (e.clientX - r.left) / r.width : (e.clientY - r.top) / r.height;
  setSize(frac);
}

function onUp(): void {
  dragging = false;
}

onMounted(() => {
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
});
onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerup", onUp);
});
</script>

<template>
  <div class="splitter" :class="`is-${orientation}`">
    <div class="splitter__a" :style="orientation === 'horizontal' ? { flexBasis: size * 100 + '%' } : { flexBasis: size * 100 + '%' }">
      <slot name="a" />
    </div>
    <div ref="gutterEl" class="splitter__gutter" :class="`is-${orientation}`" role="separator" :aria-orientation="orientation" @pointerdown="onDown">
      <slot name="gutter"><span class="splitter__grip" /></slot>
    </div>
    <div class="splitter__b"><slot name="b" /></div>
  </div>
</template>

<style scoped>
.splitter {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 120px;
}
.splitter.is-horizontal {
  flex-direction: row;
}
.splitter.is-vertical {
  flex-direction: column;
}
.splitter__a {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.splitter__b {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.splitter__gutter {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  cursor: col-resize;
  transition: background var(--dur-1) var(--ease-out);
}
.splitter__gutter.is-horizontal {
  width: 6px;
  cursor: col-resize;
}
.splitter__gutter.is-vertical {
  height: 6px;
  cursor: row-resize;
}
.splitter__gutter:hover,
.splitter__gutter:active {
  background: var(--accent-soft);
}
.splitter__grip {
  width: 1px;
  height: 24px;
  background: var(--line-strong);
}
.splitter__gutter.is-vertical .splitter__grip {
  width: 24px;
  height: 1px;
}
</style>
