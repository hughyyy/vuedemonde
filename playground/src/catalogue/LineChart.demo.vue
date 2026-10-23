<script setup lang="ts">
/** Catalogue demo: smooth filled area with a threshold, and sharp lines with gaps. */
import { CHART_COLORS, ChartLegend, LineChart } from "@vuedemonde";

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const series = [
  { name: "Requests", points: [2, 4, 3, 8, 6, 12, 9] },
  { name: "Errors", points: [1, 1, 2, 1, 3, 2, 4] },
];
const legendary = series.map((s, i) => ({ label: s.name, color: CHART_COLORS[i % CHART_COLORS.length]! }));

// `null` breaks the run — a collector outage between Wed and Thu.
const gapped = [{ name: "Requests", points: [3, 5, null, null, 7, 6, 11] }];
const thresholds = [{ value: 10, label: "budget", color: "var(--warn)" }];
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-box" style="width: 420px">
      <LineChart
        :labels="labels"
        :series="series"
        :thresholds="thresholds"
        :min="0"
        fill
        smooth
        :height="140"
        aria-label="Requests and errors per day against the budget threshold"
      />
    </div>
    <div class="cat-box" style="width: 420px">
      <LineChart :labels="labels" :series="gapped" :min="0" :height="140" aria-label="Requests per day with a two-day gap" />
    </div>
    <ChartLegend :items="legendary" />
    <span class="cat-label">filled + smooth with threshold above · sharp with a null gap below</span>
  </div>
</template>
