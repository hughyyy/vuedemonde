<script setup lang="ts">
import AppIcon from "./AppIcon.vue";

withDefaults(
  defineProps<{
    variant?: "bar" | "spinner";
    /** 0–100; undefined/omit = indeterminate */
    value?: number;
    label?: string;
    size?: "sm" | "md";
  }>(),
  { variant: "bar", size: "md" },
);
</script>

<template>
  <div class="app-progress" :class="[`is-${variant}`, `is-${size}`]" role="progressbar"
    :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100">
    <template v-if="variant === 'bar'">
      <div v-if="label" class="app-progress__label">{{ label }}</div>
      <div class="app-progress__track">
        <div class="app-progress__fill" :class="{ 'is-indeterminate': value === undefined }"
          :style="value !== undefined ? { width: `${Math.max(0, Math.min(100, value))}%` } : undefined" />
      </div>
    </template>
    <AppIcon v-else name="spinner" class="app-progress__spinner" :size="size === 'sm' ? 14 : 18" />
  </div>
</template>

<style scoped>
.app-progress {
  display: inline-flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 120px;
}
.app-progress__label {
  font: 400 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-3);
}
.app-progress__track {
  height: 4px;
  border-radius: var(--radius-pill);
  background: var(--surface-3);
  overflow: hidden;
}
.app-progress__fill {
  height: 100%;
  border-radius: var(--radius-pill);
  background: var(--accent-gradient);
  transition: width var(--dur-2) var(--ease-out);
}
.app-progress__fill.is-indeterminate {
  width: 40%;
  animation: kit-indeterminate 1.1s var(--ease-in-out) infinite;
}
.app-progress__spinner {
  color: var(--accent);
  animation: kit-spin 0.8s linear infinite;
}
@keyframes kit-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes kit-indeterminate {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(320%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-progress__fill.is-indeterminate,
  .app-progress__spinner {
    animation-duration: 2.2s;
  }
}
</style>
