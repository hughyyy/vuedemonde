<script setup lang="ts">
import { computed, ref } from "vue";

/**
 * Slider — single-value range input with pointer dragging + arrow keys.
 */

const props = withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
  }>(),
  { min: 0, max: 100, step: 1 },
);

const emit = defineEmits<{ "update:modelValue": [v: number] }>();

const trackEl = ref<HTMLElement | null>(null);

const pct = computed(() => ((props.modelValue - props.min) / (props.max - props.min || 1)) * 100);

function clamp(v: number): number {
  return Math.min(props.max, Math.max(props.min, v));
}

function fromClientX(x: number): number {
  const r = trackEl.value!.getBoundingClientRect();
  const t = clamp(((x - r.left) / r.width) * (props.max - props.min) + props.min);
  return Math.round(t / props.step) * props.step;
}

function onPointerDown(e: PointerEvent): void {
  trackEl.value?.setPointerCapture(e.pointerId);
  emit("update:modelValue", clamp(fromClientX(e.clientX)));
}

function onPointerMove(e: PointerEvent): void {
  if (e.buttons === 1) emit("update:modelValue", clamp(fromClientX(e.clientX)));
}

function onKey(e: KeyboardEvent): void {
  const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? props.step : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -props.step : 0;
  if (d) {
    e.preventDefault();
    emit("update:modelValue", clamp(props.modelValue + d));
  }
}
</script>

<template>
  <div
    ref="trackEl"
    class="slider"
    role="slider"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="modelValue"
    tabindex="0"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @keydown="onKey"
  >
    <div class="slider__track" />
    <div class="slider__fill" :style="{ width: pct + '%' }" />
    <div class="slider__thumb" :style="{ left: pct + '%' }" />
  </div>
</template>

<style scoped>
.slider {
  position: relative;
  display: flex;
  align-items: center;
  height: 20px;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}
.slider__track,
.slider__fill {
  position: absolute;
  left: 0;
  height: 4px;
  border-radius: var(--radius-pill);
}
.slider__track {
  right: 0;
  background: var(--surface-3);
}
.slider__fill {
  background: var(--accent-gradient);
}
.slider__thumb {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  transform: translate(-50%, -50%);
  border-radius: var(--radius-pill);
  background: var(--accent-ink);
  border: 2px solid var(--accent);
  box-shadow: var(--shadow-raised);
}
.slider:focus-visible .slider__thumb {
  box-shadow: var(--shadow-raised), 0 0 0 3px var(--accent-soft);
}
</style>
