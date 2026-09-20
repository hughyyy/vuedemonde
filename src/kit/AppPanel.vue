<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    padded?: boolean;
    elevation?: "flat" | "raised";
  }>(),
  { padded: true, elevation: "flat" },
);
</script>

<template>
  <section class="app-panel" :class="[`is-${elevation}`, { 'is-padded': padded }]">
    <header v-if="title || subtitle || $slots.actions" class="app-panel__head">
      <div class="app-panel__titles">
        <h3 v-if="title" class="app-panel__title">{{ title }}</h3>
        <p v-if="subtitle" class="app-panel__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="app-panel__actions"><slot name="actions" /></div>
    </header>
    <div class="app-panel__body"><slot /></div>
  </section>
</template>

<style scoped>
.app-panel {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  min-width: 0;
}
.app-panel.is-raised {
  box-shadow: var(--shadow-raised);
}
.app-panel__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--divider);
}
.app-panel__titles {
  min-width: 0;
}
.app-panel__title {
  margin: 0;
  font: 600 var(--fs-14)/1.4 var(--font-body);
  color: var(--text);
}
.app-panel__subtitle {
  margin: var(--space-1) 0 0;
  font: 400 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-3);
}
.app-panel__actions {
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.app-panel__body {
  min-width: 0;
}
.app-panel.is-padded .app-panel__body {
  padding: var(--space-4);
}
</style>
