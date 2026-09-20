<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    shape?: "box" | "circle" | "text";
    /** text mode: number of shimmering lines. */
    lines?: number;
  }>(),
  { shape: "box", lines: 0 },
);
</script>

<template>
  <div v-if="lines > 0" class="skeleton-text" :style="{ width }">
    <span
      v-for="i in lines"
      :key="i"
      class="skeleton-text__line"
      :style="{
        width: i === lines ? '60%' : '100%',
        height: height || '14px',
      }"
    />
  </div>
  <span v-else class="skeleton" :class="`is-${shape}`" :style="{ width, height, ...(shape === 'circle' ? { borderRadius: '50%' } : {}) }" aria-hidden="true" />
</template>

<style scoped>
.skeleton {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background: var(--surface-3);
  border-radius: var(--radius-sm);
  vertical-align: middle;
}
.skeleton.is-text {
  height: 1em;
}
.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.skeleton-text__line {
  display: block;
  border-radius: var(--radius-sm);
  background: var(--surface-3);
  overflow: hidden;
  position: relative;
}
.skeleton::after,
.skeleton-text__line::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, var(--surface-2), transparent);
  animation: sk-shimmer 1.4s infinite;
}
@keyframes sk-shimmer {
  100% {
    transform: translateX(100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton::after,
  .skeleton-text__line::after {
    animation: none;
  }
}
</style>
