<script setup lang="ts">
import type { IconName } from "./icons";
import AppIcon from "./AppIcon.vue";

withDefaults(
  defineProps<{
    icon?: IconName;
    title: string;
    hint?: string;
  }>(),
  { icon: "info" },
);
</script>

<template>
  <div class="app-empty">
    <div class="app-empty__icon" aria-hidden="true">
      <AppIcon :name="icon" :size="22" />
    </div>
    <p class="app-empty__title">{{ title }}</p>
    <p v-if="hint" class="app-empty__hint">{{ hint }}</p>
    <div v-if="$slots.action" class="app-empty__action"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.app-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-6);
  text-align: center;
  color: var(--text-3);
}
.app-empty__icon {
  display: grid;
  place-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-pill);
  background: var(--surface-2);
  color: var(--text-2);
}
.app-empty__title {
  margin: 0;
  font: 500 var(--fs-14)/1.4 var(--font-body);
  color: var(--text-2);
}
.app-empty__hint {
  margin: 0;
  max-width: 340px;
  font: 400 var(--fs-13)/1.5 var(--font-body);
}
.app-empty__action {
  margin-top: var(--space-2);
}
</style>
