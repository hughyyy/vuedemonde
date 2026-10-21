<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

/** Knob — circular dial input (pointer drag + arrow keys). */

const props = withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
    size?: number;
    label?: string;
  }>(),
  { min: 0, max: 100, step: 1, size: 64, label: "" },
);

const emit = defineEmits<{ "update:modelValue": [v: number] }>();

const svgEl = ref<SVGSVGElement | null>(null);
const R = 26;
const C = 2 * Math.PI * R;

const pct = computed(() => (props.modelValue - props.min) / (props.max - props.min || 1));

function clamp(v: number): number {
  return Math.min(props.max, Math.max(props.min, v));
}

function fromAngle(deg: number): number {
  const p = (deg + 135) / 270;
  const v = props.min + clamp(Math.min(1, Math.max(0, p))) * (props.max - props.min);
  return Math.round(v / props.step) * props.step;
}

function angleOf(e: PointerEvent): number {
  const rect = svgEl.value!.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
  // clamp to gauge [-135..135]
  if (deg < -135) deg = -135;
  if (deg > 135) deg = 135;
  return deg;
}

let dragging = false;

function onDown(e: PointerEvent): void {
  dragging = true;
  svgEl.value?.setPointerCapture(e.pointerId);
  onMove(e);
}

function onMove(e: PointerEvent): void {
  if (!dragging) return;
  emit("update:modelValue", clamp(fromAngle(angleOf(e))));
}

function onUp(): void {
  dragging = false;
}

function onKey(e: KeyboardEvent): void {
  const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? props.step : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -props.step : 0;
  if (d) {
    e.preventDefault();
    emit("update:modelValue", clamp(props.modelValue + d));
  }
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
  <div class="knob" :style="{ width: size + 'px', height: size + 'px' }">
    <svg
      ref="svgEl"
      :width="size"
      :height="size"
      viewBox="0 0 64 64"
      role="slider"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue"
      tabindex="0"
      @pointerdown="onDown"
      @keydown="onKey"
    >
      <circle cx="32" cy="32" :r="R" fill="none" stroke="var(--surface-3)" stroke-width="6" />
      <circle
        cx="32"
        cy="32"
        :r="R"
        fill="none"
        stroke="var(--accent)"
        stroke-width="6"
        stroke-linecap="round"
        :stroke-dasharray="C"
        :stroke-dashoffset="C - C * pct * 0.75"
        transform="rotate(-135 32 32)"
      />
      <text x="32" y="34" text-anchor="middle" class="knob__value">{{ modelValue }}</text>
      <text v-if="label" x="32" y="52" text-anchor="middle" class="knob__label">{{ label }}</text>
    </svg>
  </div>
</template>

<style scoped>
.knob {
  cursor: pointer;
  touch-action: none;
  user-select: none;
}
.knob:focus {
  outline: none;
}
.knob:focus-visible .knob__value {
  /* accessible ring via text fill */
  paint-order: stroke;
  stroke: var(--focus-ring);
  stroke-width: 1.5px;
}
.knob__value {
  fill: var(--text);
  font: 600 12px/1 var(--font-body);
}
.knob__label {
  fill: var(--text-3);
  font: 400 7px/1 var(--font-body);
}
</style>
