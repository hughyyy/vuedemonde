<script setup lang="ts">
import { computed } from "vue";
import { CHART_COLORS } from "./shared";

export type DonutSlice = { label: string; value: number; color?: string };

/**
 * DonutChart — proportional segments as a ring (donut) or filled sectors (pie).
 * `spacing` adds an angular gap (degrees) between segments.
 */

const props = withDefaults(
  defineProps<{
    data: DonutSlice[];
    size?: number;
    thickness?: number;
    /** render as a pie (filled sectors from centre) instead of a ring. */
    pie?: boolean;
    /** gap between segments, in degrees. */
    spacing?: number;
  }>(),
  { size: 160, thickness: 22, pie: false, spacing: 0 },
);

const total = computed(() => Math.max(1, props.data.reduce((n, d) => n + d.value, 0)));
const R = props.size / 2;
const OUTER = R - 1;
const INNER = Math.max(1, OUTER - props.thickness);

const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (deg: number, radius: number) => ({ x: R + radius * Math.cos(rad(deg)), y: R + radius * Math.sin(rad(deg)) });

/** [path, color, label, value] for each slice, rotating from 12 o'clock. */
function sectors(): { d: string; color: string; label: string; value: number }[] {
  let acc = 0;
  const n = props.data.length;
  const gap = props.spacing > 0 && n > 1 ? props.spacing : 0;
  return props.data.map((s) => {
    const frac = s.value / total.value;
    const sweep = frac * 360 - (gap > 0 ? gap : 0);
    const a0 = -90 + acc + (gap / 2);
    const a1 = a0 + Math.max(0.01, sweep);
    acc += frac * 360;

    if (props.pie) {
      // filled sector from centre
      const p0 = pt(a0, OUTER);
      const p1 = pt(a1, OUTER);
      const large = sweep > 180 ? 1 : 0;
      const d = `M${R},${R} L${p0.x},${p0.y} A${OUTER},${OUTER} 0 ${large} 1 ${p1.x},${p1.y} Z`;
      return { d, color: s.color ?? CHART_COLORS[props.data.indexOf(s) % CHART_COLORS.length], label: s.label, value: s.value };
    }

    // annular ring sector
    const o0 = pt(a0, OUTER);
    const o1 = pt(a1, OUTER);
    const i0 = pt(a1, INNER);
    const i1 = pt(a0, INNER);
    const large = sweep > 180 ? 1 : 0;
    const d = `M${o0.x},${o0.y} A${OUTER},${OUTER} 0 ${large} 1 ${o1.x},${o1.y} L${i0.x},${i0.y} A${INNER},${INNER} 0 ${large} 0 ${i1.x},${i1.y} Z`;
    return { d, color: s.color ?? CHART_COLORS[props.data.indexOf(s) % CHART_COLORS.length], label: s.label, value: s.value };
  });
}
</script>

<template>
  <div class="chart">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" role="img">
      <path v-for="(s, i) in sectors()" :key="i" :d="s.d" :fill="s.color">
        <title>{{ `${s.label}: ${s.value}` }}</title>
      </path>
      <text v-if="!pie" :x="R" :y="R - 2" text-anchor="middle" class="chart__total">{{ total }}</text>
      <text v-if="!pie" :x="R" :y="R + 14" text-anchor="middle" class="chart__total-label">total</text>
    </svg>
  </div>
</template>

<style scoped>
.chart svg {
  display: block;
}
.chart__total {
  fill: var(--text);
  font: 700 20px/1 var(--font-body);
}
.chart__total-label {
  fill: var(--text-3);
  font: 400 10px/1 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
