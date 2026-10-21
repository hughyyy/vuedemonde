<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

/**
 * Splitter — resizable two-pane split (side-by-side or stacked) with a
 * draggable gutter. First pane size = `modelValue` fraction (0–1); the value
 * is CONTROLLED — the pane re-lays-out to a changed modelValue (e.g. a
 * restored persisted ratio), so a fresh 50/50 split can never inherit a stale
 * size from a recycled instance. Keyboard: focusable separator, arrow keys.
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
  const clamped = Math.min(0.9, Math.max(0.1, Number.isFinite(v) ? v : 0.5));
  // round to 2dp so repeated arrow steps never accumulate float drift in the
  // persisted tree (0.7000000000000002 was ugly round-tripping through JSON)
  size.value = Math.round(clamped * 100) / 100;
  emit("update:modelValue", size.value);
}

// Controlled from outside: a changed modelValue (restored ratio, fresh 50/50
// split, programmatic change) re-lays-out the panes immediately.
watch(
  () => props.modelValue,
  (v) => {
    if (typeof v === "number") size.value = Math.min(0.9, Math.max(0.1, v));
  },
);

const STEP = 0.05;
function onKeydown(e: KeyboardEvent): void {
  const horizontal = props.orientation === "horizontal";
  const inc = e.key === "ArrowRight" || e.key === "ArrowDown";
  const dec = e.key === "ArrowLeft" || e.key === "ArrowUp";
  if (!inc && !dec) return;
  e.preventDefault();
  // a horizontal split resizes left/right; a vertical one up/down
  const grow = horizontal ? e.key === "ArrowRight" : e.key === "ArrowDown";
  setSize(size.value + (grow ? STEP : -STEP));
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
    <div class="splitter__a" :style="{ flexBasis: size * 100 + '%' }">
      <slot name="a" />
    </div>
    <div
      ref="gutterEl"
      class="splitter__gutter"
      :class="`is-${orientation}`"
      role="separator"
      tabindex="0"
      :aria-orientation="orientation"
      :aria-label="'Resize split (' + Math.round(size * 100) + '%) — drag or arrow keys'"
      @pointerdown="onDown"
      @keydown="onKeydown"
    >
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
