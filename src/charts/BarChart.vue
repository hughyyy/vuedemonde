<script setup lang="ts">
import { computed } from "vue";
import { CHART_COLORS, fmtTick, niceMax, type ChartMargins } from "./shared";

export type BarSeries = { name: string; data: number[]; color?: string };

/** BarChart — grouped bars over category labels with axes + gridlines. */

const props = withDefaults(
  defineProps<{
    labels: string[];
    series: BarSeries[];
    height?: number;
    stacked?: boolean;
    margin?: Partial<ChartMargins>;
  }>(),
  { height: 260, stacked: false, margin: () => ({}) },
);

const M: ChartMargins = { top: 12, right: 12, bottom: 34, left: 40, ...props.margin };
const W = 480;

const innerW = computed(() => W - M.left - M.right);
const innerH = computed(() => props.height - M.top - M.bottom);

const yMax = computed(() => {
  if (props.stacked) {
    return niceMax(Math.max(1, ...props.labels.map((_, ci) => props.series.reduce((n, s) => n + (s.data[ci] ?? 0), 0))));
  }
  return niceMax(Math.max(1, ...props.series.flatMap((s) => s.data)));
});

const yTicks = computed(() => Array.from({ length: 5 }, (_, i) => (yMax.value * i) / 4));
const yPos = (v: number) => M.top + innerH.value - (v / yMax.value) * innerH.value;

const xStep = computed(() => innerW.value / Math.max(1, props.labels.length));
const band = computed(() => (xStep.value * 0.72) / Math.max(1, props.series.length));
const barW = computed(() => (props.stacked ? xStep.value * 0.72 : Math.max(2, band.value * 0.8)));

function barX(cat: number, sIdx: number): number {
  if (props.stacked) {
    const colW = xStep.value * 0.72;
    return M.left + cat * xStep.value + (xStep.value - colW) / 2;
  }
  return M.left + cat * xStep.value + (xStep.value - band.value) / 2 + sIdx * band.value;
}

/** [y, height] for a bar — stacked offsets accumulate when `stacked`. */
function spec(sIdx: number, cat: number): { y: number; height: number } {
  const v = props.series[sIdx]!.data[cat] ?? 0;
  if (!props.stacked) {
    return { y: yPos(v), height: Math.max(0, innerH.value - (v / yMax.value) * innerH.value) };
  }
  const below = props.series.slice(0, sIdx).reduce((n, s) => n + (s.data[cat] ?? 0), 0);
  const top = below + v;
  return { y: yPos(top), height: Math.max(0, yPos(below) - yPos(top)) };
}
</script>

<template>
  <div class="chart">
    <svg :width="W" :height="height" :viewBox="`0 0 ${W} ${height}`" role="img">
      <!-- gridlines + y ticks -->
      <line v-for="t in yTicks" :key="t" :x1="M.left" :x2="W - M.right" :y1="yPos(t)" :y2="yPos(t)" class="chart__grid" />
      <text v-for="t in yTicks" :key="'t' + t" :x="M.left - 6" :y="yPos(t) + 3" class="chart__tick" text-anchor="end">
        {{ fmtTick(Math.round(t)) }}
      </text>
      <!-- x labels -->
      <text v-for="(l, i) in labels" :key="l" :x="M.left + i * xStep + xStep / 2" :y="height - 8" class="chart__tick" text-anchor="middle">
        {{ l }}
      </text>
      <!-- bars -->
      <g v-for="(s, si) in series" :key="s.name">
        <rect
          v-for="(v, ci) in s.data"
          :key="ci"
          :x="barX(ci, si)"
          :y="spec(si, ci).y"
          :width="barW"
          :height="spec(si, ci).height"
          rx="3"
          :fill="s.color ?? CHART_COLORS[si % CHART_COLORS.length]"
        >
          <title>{{ `${s.name} · ${labels[ci]} = ${v}` }}</title>
        </rect>
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
