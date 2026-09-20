<script setup lang="ts">
import { computed } from "vue";

export type MeterItem = {
  label: string;
  value: number;
  max?: number;
  tint?: "ok" | "warn" | "err" | "info" | "run" | "accent";
};

/** MeterGroup — stacked measurement bar with legend. */

const props = withDefaults(
  defineProps<{
    meters: MeterItem[];
  }>(),
  {},
);

const commonMax = computed(() => Math.max(1, ...props.meters.map((m) => m.max ?? m.value)));

const tintVar = (t?: MeterItem["tint"]) =>
  ({ ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)", run: "var(--run)", info: "var(--info)", accent: "var(--accent)" } as const)[t ?? "accent"];
</script>

<template>
  <div class="meter-group">
    <div class="meter-group__track">
      <span
        v-for="(m, i) in meters"
        :key="i"
        class="meter-group__seg"
        :style="{ width: (m.value / commonMax) * 100 + '%', background: tintVar(m.tint) }"
        :title="`${m.label}: ${m.value}${m.max ? '/' + m.max : ''}`"
      />
    </div>
    <div class="meter-group__legend">
      <span v-for="(m, i) in meters" :key="i" class="meter-group__item">
        <span class="meter-group__dot" :style="{ background: tintVar(m.tint) }" />
        <span class="meter-group__label">{{ m.label }}</span>
        <span class="meter-group__value">{{ m.value }}{{ m.max ? "/" + m.max : "" }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.meter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}
.meter-group__track {
  display: flex;
  height: 10px;
  gap: 2px;
  border-radius: var(--radius-pill);
  background: var(--surface-3);
  overflow: hidden;
}
.meter-group__seg {
  height: 100%;
  border-radius: var(--radius-pill);
}
.meter-group__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
.meter-group__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font: 400 var(--fs-12)/1.5 var(--font-body);
  color: var(--text-2);
}
.meter-group__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
}
.meter-group__label {
  color: var(--text-2);
}
.meter-group__value {
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
</style>
