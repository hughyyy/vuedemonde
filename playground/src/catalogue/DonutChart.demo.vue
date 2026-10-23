<script setup lang="ts">
/** Catalogue demo: donut with centre total beside a pie and its legend. */
import { CHART_COLORS, ChartLegend, DonutChart } from "@vuedemonde";

const data = [
  { label: "Platform", value: 34 },
  { label: "Data", value: 26 },
  { label: "Ops", value: 20 },
  { label: "Other", value: 20 },
];
const legend = data.map((d, i) => ({ label: d.label, color: CHART_COLORS[i % CHART_COLORS.length]! }));
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-row" style="gap: 18px">
      <DonutChart :data="data" :size="140" :thickness="20" aria-label="Spend by area" />
      <DonutChart :data="data" pie :size="110" :spacing="2" aria-label="Spend by area as a pie" />
      <ChartLegend :items="legend" />
    </div>
    <span class="cat-label">ring with centre total · pie with 2° spacing</span>
  </div>
</template>
