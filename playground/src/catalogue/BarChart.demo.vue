<script setup lang="ts">
/** Catalogue demo: grouped and stacked bars over the same series, with legend. */
import { BarChart, CHART_COLORS, ChartLegend } from "@vuedemonde";

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const series = [
  { name: "Inbound", data: [12, 19, 15, 22, 18, 30] },
  { name: "Outbound", data: [9, 12, 18, 14, 21, 17] },
];
const legend = series.map((s, i) => ({ label: s.name, color: CHART_COLORS[i % CHART_COLORS.length]! }));
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-box" style="width: 420px">
      <BarChart :labels="labels" :series="series" :height="150" aria-label="Inbound and outbound volume per day" />
    </div>
    <div class="cat-box" style="width: 420px">
      <BarChart :labels="labels" :series="series" stacked :height="150" aria-label="Inbound and outbound volume per day, stacked" />
    </div>
    <ChartLegend :items="legend" />
    <span class="cat-label">grouped above · stacked below</span>
  </div>
</template>
