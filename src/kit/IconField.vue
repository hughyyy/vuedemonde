<script setup lang="ts">
import AppIcon from "./AppIcon.vue";
import type { IconName } from "./icons";

/** IconField — wraps an input with a leading/trailing icon. */

withDefaults(
  defineProps<{
    icon: IconName;
    position?: "left" | "right";
  }>(),
  { position: "left" },
);
</script>

<template>
  <label class="icon-field" :class="`is-${position}`">
    <AppIcon :name="icon" :size="14" class="icon-field__icon" />
    <slot />
  </label>
</template>

<style scoped>
.icon-field {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.icon-field__icon {
  position: absolute;
  z-index: 1;
  color: var(--text-3);
  pointer-events: none;
}
.icon-field.is-left .icon-field__icon {
  left: var(--space-3);
}
.icon-field.is-right .icon-field__icon {
  right: var(--space-3);
}
.icon-field.is-left :deep(input),
.icon-field.is-left :deep(textarea) {
  padding-left: var(--space-6);
}
.icon-field.is-right :deep(input),
.icon-field.is-right :deep(textarea) {
  padding-right: var(--space-6);
}
</style>
