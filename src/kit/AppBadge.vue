<script setup lang="ts">
withDefaults(
  defineProps<{
    tint?: "neutral" | "ok" | "warn" | "err" | "run" | "info" | "accent" | "p0" | "p1" | "p2" | "p3";
    dot?: boolean;
  }>(),
  { tint: "neutral", dot: false },
);
</script>

<template>
  <span class="app-badge" :class="`is-${tint}`">
    <span v-if="dot" class="app-badge__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 1px var(--space-2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text-2);
  font: 600 var(--fs-11)/1.6 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.app-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-pill);
  background: currentColor;
}
.is-ok {
  background: var(--ok-soft);
  border-color: transparent;
  color: var(--ok);
}
.is-warn {
  background: var(--warn-soft);
  border-color: transparent;
  color: var(--warn);
}
.is-err {
  background: var(--err-soft);
  border-color: transparent;
  color: var(--err);
}
.is-run {
  background: var(--run-soft);
  border-color: transparent;
  color: var(--run);
}
.is-info {
  background: var(--info-soft);
  border-color: transparent;
  color: var(--info);
}
.is-accent {
  background: var(--accent-soft);
  border-color: transparent;
  color: var(--accent);
}
/* priority tints: P0 critical → P3 low */
.is-p0 {
  background: var(--err-soft);
  border-color: transparent;
  color: var(--err);
}
.is-p1 {
  background: var(--warn-soft);
  border-color: transparent;
  color: var(--warn);
}
.is-p2 {
  background: var(--run-soft);
  border-color: transparent;
  color: var(--run);
}
.is-p3 {
  background: var(--surface-3);
  border-color: transparent;
  color: var(--text-3);
}
</style>
