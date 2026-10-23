<script setup lang="ts">
/** Catalogue demo: stacked resource meter, with and without individual maxima. */
import { MeterGroup } from "@vuedemonde";

/** Not barrel-exported by the kit — mirrors the component's item shape. */
type MeterItem = {
  label: string;
  value: number;
  max?: number;
  tint?: "ok" | "warn" | "err" | "info" | "run" | "accent";
};

const capacity: MeterItem[] = [
  { label: "CPU", value: 64, max: 100, tint: "ok" },
  { label: "Memory", value: 82, max: 100, tint: "warn" },
  { label: "Disk", value: 47, max: 100, tint: "info" },
  { label: "Network", value: 21, max: 100, tint: "accent" },
];

const quota: MeterItem[] = [
  { label: "Used", value: 42 },
  { label: "Reserved", value: 18, tint: "info" },
  { label: "Free", value: 60, tint: "ok" },
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <span class="cat-label">host utilisation (0–100)</span>
      <MeterGroup :meters="capacity" />
    </div>
    <div class="cat-col">
      <span class="cat-label">storage quota</span>
      <MeterGroup :meters="quota" />
    </div>
  </div>
</template>
