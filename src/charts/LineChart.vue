<script setup lang="ts">
import { computed } from "vue";
import { CHART_COLORS, fmtTick, niceMax, type ChartMargins } from "./shared";

export type LineSeries = { name: string; points: number[]; color?: string };

/** LineChart — line (or area) series with dots + axes. */

const props = withDefaults(
  defineProps<{
    labels: string[];
    series: LineSeries[];
    fill?: boolean;
    dots?: boolean;
    /** smooth = Catmull-Rom curve through the points; elses sharp L-segments. */
    smooth?: boolean;
    height?: number;
    margin?: Partial<ChartMargins>;
  }>(),
  { fill: false, dots: true, smooth: false, height: 260, margin: () => ({}) },
);

const M: ChartMargins = { top: 12, right: 12, bottom: 34, left: 40, ...props.margin };
const W = 480;

const innerW = computed(() => W - M.left - M.right);
const innerH = computed(() => props.height - M.top - M.bottom);

const yMax = computed(() => niceMax(Math.max(1, ...props.series.flatMap((s) => s.points))));
const yTicks = computed(() => Array.from({ length: 5 }, (_, i) => (yMax.value * i) / 4));
const xStep = computed(() => innerW.value / Math.max(1, props.labels.length - 1));
const yPos = (v: number) => M.top + innerH.value - (v / yMax.value) * innerH.value;
const xPos = (i: number) => M.left + i * xStep.value;

function pts(s: LineSeries): { x: number; y: number }[] {
  return s.points.map((v, i) => ({ x: xPos(i), y: yPos(v) }));
}

/** Straight or Catmull-Rom-smoothed path through the points. */
function line(p: { x: number; y: number }[]): string {
  if (!props.smooth || p.length < 3) {
    return p.map((q, i) => `${i === 0 ? "M" : "L"}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");
  }
  let d = `M${p[0]!.x.toFixed(1)},${p[0]!.y.toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i]!;
    const p1 = p[i]!;
    const p2 = p[i + 1]!;
    const p3 = p[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

function linePath(s: LineSeries): string {
  return line(pts(s));
}

function areaPath(s: LineSeries): string {
  const p = pts(s);
  const base = M.top + innerH.value;
  const first = Math.min(...p.map((q) => q.x));
  const last = Math.max(...p.map((q) => q.x));
  return `${line(p)} L${last.toFixed(1)},${base} L${first.toFixed(1)},${base} Z`;
}
</script>

<template>
  <div class="chart">
    <svg :width="W" :height="height" :viewBox="`0 0 ${W} ${height}`" role="img">
      <line v-for="t in yTicks" :key="t" :x1="M.left" :x2="W - M.right" :y1="yPos(t)" :y2="yPos(t)" class="chart__grid" />
      <text v-for="t in yTicks" :key="'t' + t" :x="M.left - 6" :y="yPos(t) + 3" class="chart__tick" text-anchor="end">
        {{ fmtTick(Math.round(t)) }}
      </text>
      <text v-for="(l, i) in labels" :key="l" :x="xPos(i)" :y="height - 8" class="chart__tick" text-anchor="middle">
        {{ l }}
      </text>
      <g v-for="(s, si) in series" :key="s.name" :stroke="s.color ?? CHART_COLORS[si % CHART_COLORS.length]">
        <path v-if="fill" :d="areaPath(s)" :fill="s.color ?? CHART_COLORS[si % CHART_COLORS.length]" fill-opacity="0.14" stroke="none" />
        <path :d="linePath(s)" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <circle v-if="dots" v-for="(v, i) in s.points" :key="i" :cx="xPos(i)" :cy="yPos(v)" r="3" fill="var(--surface-1)" stroke-width="2">
          <title>{{ `${s.name} · ${labels[i]} = ${v}` }}</title>
        </circle>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.chart {
  min-width: 0;
}
.chart svg {
  display: block;
  max-width: 100%;
  height: auto;
}
.chart__grid {
  stroke: var(--divider);
  stroke-width: 1;
}
.chart__tick {
  fill: var(--text-3);
  font: 400 11px/1 var(--font-body);
}
</style>
