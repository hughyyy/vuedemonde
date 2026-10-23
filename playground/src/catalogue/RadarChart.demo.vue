<script setup lang="ts">
/** Catalogue demo: two radar series over six categories, legend alongside. */
import { CHART_COLORS, ChartLegend, RadarChart } from "@vuedemonde";

const labels = ["Perf", "Cost", "Reliability", "Security", "Usability", "Velocity"];
const series = [
  { name: "Current", values: [80, 65, 90, 55, 75, 60] },
  { name: "Target", values: [90, 85, 95, 80, 88, 92] },
];
const legend = series.map((s, i) => ({ label: s.name, color: CHART_COLORS[i % CHART_COLORS.length]! }));
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-row" style="gap: 16px">
      <RadarChart :labels="labels" :series="series" :size="230" :rings="4" aria-label="Current and target scores across six categories" />
      <ChartLegend :items="legend" />
    </div>
  </div>
</template>
