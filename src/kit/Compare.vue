<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

/** Compare — two images/panels revealed by a draggable divider (before/after). */

const props = withDefaults(
  defineProps<{
    modelValue?: number;
  }>(),
  {},
);

const emit = defineEmits<{ "update:modelValue": [v: number] }>();

const pos = ref(Math.min(0.9, Math.max(0.1, props.modelValue ?? 0.5)));
const hostEl = ref<HTMLElement | null>(null);
const handleEl = ref<HTMLElement | null>(null);

let dragging = false;

function setPos(v: number): void {
  pos.value = Math.min(0.9, Math.max(0.1, v));
  if (props.modelValue !== undefined) emit("update:modelValue", pos.value);
}

function onDown(e: PointerEvent): void {
  dragging = true;
  handleEl.value?.setPointerCapture(e.pointerId);
  move(e);
}

function move(e: PointerEvent): void {
  if (!dragging) return;
  const r = hostEl.value!.getBoundingClientRect();
  setPos((e.clientX - r.left) / r.width);
}

onMounted(() => {
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", () => (dragging = false));
});
onBeforeUnmount(() => window.removeEventListener("pointermove", move));
</script>

<template>
  <div ref="hostEl" class="compare">
    <div class="compare__clip is-a" :style="{ clipPath: `inset(0 ${100 - pos * 100}% 0 0)` }"><slot name="a" /></div>
    <div class="compare__clip is-b" :style="{ clipPath: `inset(0 0 0 ${pos * 100}%)` }"><slot name="b" /></div>
    <div ref="handleEl" class="compare__handle" :style="{ left: pos * 100 + '%' }" role="slider" :aria-valuenow="Math.round(pos * 100)" aria-valuemin="0" aria-valuemax="100" @pointerdown="onDown">
      <slot name="handle"><span class="compare__grip" /></slot>
    </div>
  </div>
</template>

<style scoped>
.compare {
  position: relative;
  overflow: hidden;
  min-height: 160px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  user-select: none;
  touch-action: none;
}
.compare__clip {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.compare__clip > * {
  width: 100%;
  height: 100%;
}
.compare__handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 14px;
  transform: translateX(-50%);
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.compare__handle::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--surface-1);
  box-shadow: 0 0 0 1px var(--line);
}
.compare__grip {
  position: relative;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: var(--surface-1);
  box-shadow: var(--shadow-raised);
}
.compare__grip::before {
  content: "⇔";
  color: var(--text-2);
  font-size: var(--fs-12);
  line-height: 1;
}
</style>
