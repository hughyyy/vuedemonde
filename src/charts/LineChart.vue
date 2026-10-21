<script setup lang="ts">
import { computed } from "vue";
import { CHART_COLORS, fmtTick, type ChartMargins } from "./shared";
import { pathOf, ticksFor, valueRange, type Scale, type ValueRange } from "./geometry";

export type LineSeries = { name: string; points: Array<number | null>; color?: string };

/** A horizontal rule drawn over the series (monitor critical/warning style). */
export type ThresholdDef = { value: number; label?: string; color?: string };

/**
 * LineChart — line (or area) series with dots + axes. `null` points are
 * **gaps**: the line breaks there instead of dipping to zero. Optional
 * dashed threshold rules that participate in the y-domain.
 */

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
    /** horizontal rules drawn over the series; their values join the y-domain. */
    thresholds?: ThresholdDef[];
    /** labels are epoch-ms numbers — the axis renders HH:MM. */
    time?: boolean;
    /** the y-domain never drops below this (0 forces a zero baseline for counters). */
    min?: number;
  }>(),
  { fill: false, dots: true, smooth: false, height: 260, margin: () => ({}), time: false },
);

const M: ChartMargins = { top: 12, right: 12, bottom: 34, left: 40, ...props.margin };
const W = 480;

const innerW = computed(() => W - M.left - M.right);
const innerH = computed(() => props.height - M.top - M.bottom);

const range = computed<ValueRange>(() => {
  const r = valueRange(props.series, props.thresholds?.map((t) => t.value) ?? []);
  if (props.min === undefined || r.empty || props.min >= r.min) return r;
  return { min: props.min, max: r.max, empty: false };
});

const span = computed(() => range.value.max - range.value.min || 1);

const yTicks = computed(() => ticksFor(range.value.min, range.value.max));
const yPos = (v: number) => M.top + innerH.value - ((v - range.value.min) / span.value) * innerH.value;
const xPos = (i: number) => M.left + i * (innerW.value / Math.max(1, props.labels.length - 1));

const scale: Scale = { x: xPos, y: yPos, ticks: yTicks.value };

/** Axis label: pass-through strings, or HH:MM when `time` treats labels as epoch-ms. */
function fmtAxis(l: string): string {
  if (!props.time) return l;
  const d = new Date(Number(l));
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

type Pt = { x: number; y: number };

/** Contiguous finite runs of a series — gaps split it into separate strokes. */
function runs(s: LineSeries): Pt[][] {
  const out: Pt[][] = [];
  let run: Pt[] = [];
  for (let i = 0; i < s.points.length; i++) {
    const v = s.points[i];
    if (v === null || !Number.isFinite(v)) {
      if (run.length) {
        out.push(run);
        run = [];
      }
      continue;
    }
    run.push({ x: xPos(i), y: yPos(v) });
  }
  if (run.length) out.push(run);
  return out;
}

/** Straight or Catmull-Rom-smoothed path through one gap-free run. */
function line(p: Pt[]): string {
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
  if (!props.smooth) return pathOf(s.points, scale);
  return runs(s).map(line).join(" ");
}

function areaPath(s: LineSeries): string {
  const base = M.top + innerH.value;
  return runs(s)
    .map((run) => {
      const first = run[0]!;
      const last = run[run.length - 1]!;
      return `${line(run)} L${last.x.toFixed(1)},${base} L${first.x.toFixed(1)},${base} Z`;
    })
    .join(" ");
}

function dotPts(s: LineSeries): { x: number; y: number; value: number; i: number }[] {
  const out: { x: number; y: number; value: number; i: number }[] = [];
  for (let i = 0; i < s.points.length; i++) {
    const v = s.points[i];
    if (v === null || !Number.isFinite(v)) continue;
    out.push({ x: xPos(i), y: yPos(v), value: v, i });
  }
  return out;
}
</script>

<template>
  <div class="chart">
    <svg :width="W" :height="height" :viewBox="`0 0 ${W} ${height}`" role="img">
      <line v-for="t in yTicks" :key="t" :x1="M.left" :x2="W - M.right" :y1="yPos(t)" :y2="yPos(t)" class="chart__grid" />
      <text v-for="t in yTicks" :key="'t' + t" :x="M.left - 6" :y="yPos(t) + 3" class="chart__tick" text-anchor="end">
        {{ fmtTick(t) }}
      </text>
      <text v-for="(l, i) in labels" :key="i" :x="xPos(i)" :y="height - 8" class="chart__tick" text-anchor="middle">
        {{ fmtAxis(l) }}
      </text>
      <g v-for="(th, ti) in thresholds" :key="'th' + ti">
        <line
          :x1="M.left"
          :x2="W - M.right"
          :y1="yPos(th.value)"
          :y2="yPos(th.value)"
          class="chart__threshold"
          :stroke="th.color ?? 'var(--err)'"
        />
        <text
          v-if="th.label !== undefined"
          :x="W - M.right - 4"
          :y="yPos(th.value) - 4"
          class="chart__tick chart__threshold-label"
          text-anchor="end"
          :fill="th.color ?? 'var(--err)'"
        >
          {{ th.label }}
        </text>
      </g>
      <g v-for="(s, si) in series" :key="s.name" :stroke="s.color ?? CHART_COLORS[si % CHART_COLORS.length]">
        <path v-if="fill" :d="areaPath(s)" :fill="s.color ?? CHART_COLORS[si % CHART_COLORS.length]" fill-opacity="0.14" stroke="none" />
        <path :d="linePath(s)" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <circle v-if="dots" v-for="dp in dotPts(s)" :key="dp.i" :cx="dp.x" :cy="dp.y" r="3" fill="var(--surface-1)" stroke-width="2">
          <title>{{ `${s.name} · ${fmtAxis(labels[dp.i] ?? "")} = ${dp.value}` }}</title>
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
.chart__threshold {
  stroke-dasharray: 4 3;
  stroke-width: 1.5;
}
.chart__threshold-label {
  font-size: 10px;
}
</style>
