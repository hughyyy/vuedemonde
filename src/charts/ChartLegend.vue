<script setup lang="ts">
/** ChartLegend — dot + label row for chart series. */

withDefaults(
  defineProps<{
    items: { label: string; color: string }[];
  }>(),
  {},
);
</script>

<template>
  <div class="chart-legend">
    <span v-for="it in items" :key="it.label" class="chart-legend__item">
      <span class="chart-legend__dot" :style="{ background: it.color }" />
      {{ it.label }}
    </span>
  </div>
</template>

<style scoped>
.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
.chart-legend__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font: 400 var(--fs-12)/1.5 var(--font-body);
  color: var(--text-2);
}
.chart-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
}
</style>
