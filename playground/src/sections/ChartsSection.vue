<script setup lang="ts">
import { ref } from "vue";
import {
  AppToggle, BarChart, ChartLegend, DonutChart, LineChart, RadarChart,
} from "@vuedemond";
import DemoCard from "../DemoCard.vue";

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const bars = [
  { name: "Inbound", data: [12, 19, 15, 22, 18, 30], color: "#4f9cf9" },
  { name: "Outbound", data: [9, 12, 18, 14, 21, 17], color: "#f0a33c" },
];
const lines = [
  { name: "Requests", points: [2, 4, 3, 8, 6, 12, 9], color: "#4f9cf9" },
  { name: "Errors", points: [1, 1, 2, 1, 3, 2, 4], color: "#f25d5d" },
];
const donut = [
  { label: "Platform", value: 34, color: "#4f9cf9" },
  { label: "Data", value: 26, color: "#f97316" },
  { label: "Ops", value: 20, color: "#10b981" },
  { label: "Other", value: 20, color: "#e11d48" },
];
const radar = [
  { name: "Current", values: [80, 65, 90, 55, 75, 60] },
  { name: "Target", values: [90, 85, 95, 80, 88, 92] },
];
const radarLabels = ["Perf", "Cost", "Reliability", "Security", "Usability", "Velocity"];

const stacked = ref(false);
</script>

<template>
  <div>
    <h2 class="sec-title">Charts <span class="hint">dependency-free inline SVG on the tokens</span></h2>

    <DemoCard title="BarChart" desc="Grouped or stacked bars with axes, gridlines and ticks.">
      <BarChart :labels="labels" :series="bars" :stacked="stacked" :height="200" />
      <div class="row">
        <AppToggle v-model="stacked" label="stacked" />
        <ChartLegend :items="bars.map((b) => ({ label: b.name, color: b.color ?? '#4f9cf9' }))" />
      </div>
    </DemoCard>

    <DemoCard title="LineChart" desc="Sharp or smooth lines with optional fill and dots.">
      <LineChart :labels="labels" :series="lines" fill smooth :dots="true" :height="200" />
    </DemoCard>

    <DemoCard title="DonutChart" desc="Ring or pie segments with spacing.">
      <div class="row">
        <DonutChart :data="donut" :size="150" :thickness="22" />
        <DonutChart :data="donut" pie :size="120" :spacing="2" />
        <ChartLegend :items="donut.map((d) => ({ label: d.label, color: d.color ?? '#4f9cf9' }))" />
      </div>
    </DemoCard>

    <DemoCard title="RadarChart" desc="Multi-series radar with configurable rings.">
      <RadarChart :labels="radarLabels" :series="radar" :size="260" :rings="4" />
    </DemoCard>
  </div>
</template>

<style scoped>
.sec-title {
  margin: 0 0 16px;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.hint {
  font-size: var(--fs-12);
  font-weight: var(--fw-400);
  color: var(--text-3);
}
.row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 10px;
}
</style>
