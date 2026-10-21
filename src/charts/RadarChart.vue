<script setup lang="ts">
import { computed } from "vue";
import { CHART_COLORS, niceMax } from "./shared";

export type RadarSeries = { name: string; values: number[]; color?: string };

/**
 * RadarChart — radial grid with axes from the centre and a polygon per series
 * showing strength across categories.
 */

const props = withDefaults(
  defineProps<{
    labels: string[];
    series: RadarSeries[];
    size?: number;
    rings?: number;
    max?: number;
    /** accessible label for the chart image. */
    ariaLabel?: string;
  }>(),
  { size: 280, rings: 4, max: 0 },
);

const n = computed(() => Math.max(3, props.labels.length));
const cx = props.size / 2;
const cy = props.size / 2;
const radius = props.size / 2 - 24;
const ring = computed(() => Math.max(1, props.max, ...props.series.flatMap((s) => s.values)));
const max = computed(() => props.max > 0 ? props.max : niceMax(ring.value));

const rad = (deg: number) => (deg * Math.PI) / 180;
const angle = (i: number) => -90 + i * (360 / n.value);
const pt = (i: number, scale: number) => ({
  x: cx + radius * scale * Math.cos(rad(angle(i))),
  y: cy + radius * scale * Math.sin(rad(angle(i))),
});

const ringsPoly = computed(() =>
  Array.from({ length: props.rings }, (_, r) => {
    const k = (r + 1) / props.rings;
    return `M${pt(0, k).x},${pt(0, k).y} ${Array.from({ length: n.value }, (_, i) => { const p = pt(i, k); return `L${p.x},${p.y}`; }).join(" ")} Z`;
  }),
);

function polygon(s: RadarSeries): string {
  return `M${s.values.map((v, i) => { const p = pt(i, v / max.value); return `${i === 0 ? "" : "L"}${p.x},${p.y}`; }).join(" ")} Z`;
}
</script>

<template>
  <div class="chart">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" :role="'img'" :aria-label="ariaLabel">
      <!-- radial grid rings -->
      <path v-for="(p, i) in ringsPoly" :key="i" :d="p" fill="none" stroke="var(--divider)" stroke-width="1" />
      <!-- axes from centre to each category -->
      <line v-for="i in n" :key="'a' + i" :x1="cx" :y1="cy" :x2="pt(i - 1, 1).x" :y2="pt(i - 1, 1).y" stroke="var(--divider)" stroke-width="1" />
      <!-- category labels -->
      <text v-for="(l, i) in labels" :key="l" :x="pt(i, 1.14).x" :y="pt(i, 1.14).y" class="chart__label" text-anchor="middle">
        {{ l }}
      </text>
      <!-- value polygons -->
      <path v-for="(s, si) in series" :key="s.name" :d="polygon(s)" :fill="s.color ?? CHART_COLORS[si % CHART_COLORS.length]" fill-opacity="0.16" :stroke="s.color ?? CHART_COLORS[si % CHART_COLORS.length]" stroke-width="2" stroke-linejoin="round">
        <title>{{ `${s.name} — ${s.values.join(', ')}` }}</title>
      </path>
    </svg>
  </div>
</template>

<style scoped>
.chart svg {
  display: block;
}
.chart__label {
  fill: var(--text-3);
  font: 400 11px/1 var(--font-body);
}
</style>
