<script setup lang="ts">
/** Catalogue demo: the shared chart legend in two densities. */
import { CHART_COLORS, ChartLegend } from "@vuedemonde";

const full = ["Inbound", "Outbound", "Retries", "Dropped", "Queued", "Replayed"].map((label, i) => ({
  label,
  color: CHART_COLORS[i % CHART_COLORS.length]!,
}));

const short = ["Requests", "Errors", "Budget"].map((label, i) => ({
  label,
  color: CHART_COLORS[i % CHART_COLORS.length]!,
}));
</script>

<template>
  <div class="cat-demo cat-fill">
    <ChartLegend :items="full" />
    <div class="cat-row">
      <ChartLegend :items="short" />
    </div>
    <span class="cat-label">wraps when the row runs out of width</span>
  </div>
</template>
