<script setup lang="ts">
withDefaults(
  defineProps<{
    text: string;
    placement?: "top" | "bottom" | "left" | "right";
  }>(),
  { placement: "top" },
);
</script>

<template>
  <span class="app-tooltip" :class="`is-${placement}`" tabindex="0">
    <slot />
    <span class="app-tooltip__bubble" role="tooltip">{{ text }}</span>
  </span>
</template>

<style scoped>
.app-tooltip {
  position: relative;
  display: inline-flex;
}
.app-tooltip__bubble {
  position: absolute;
  z-index: 500;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--text);
  color: var(--bg);
  font: 400 var(--fs-12)/1.4 var(--font-body);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--dur-1) var(--ease-out);
  box-shadow: var(--shadow-raised);
}
/* centered on the axis it overlaps */
.app-tooltip.is-top .app-tooltip__bubble {
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
}
.app-tooltip.is-bottom .app-tooltip__bubble {
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
}
.app-tooltip.is-left .app-tooltip__bubble {
  right: calc(100% + 6px);
  top: 50%;
  transform: translateY(-50%);
}
.app-tooltip.is-right .app-tooltip__bubble {
  left: calc(100% + 6px);
  top: 50%;
  transform: translateY(-50%);
}
.app-tooltip:hover .app-tooltip__bubble,
.app-tooltip:focus-visible .app-tooltip__bubble {
  opacity: 1;
}
</style>
