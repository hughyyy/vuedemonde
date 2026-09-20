<script setup lang="ts">
/** Card — dedicated surface container (header / body / footer). */

withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    padded?: boolean;
  }>(),
  { padded: true },
);
</script>

<template>
  <div class="card">
    <header v-if="title || subtitle || $slots.actions" class="card__head">
      <div class="card__titles">
        <h3 v-if="title" class="card__title">{{ title }}</h3>
        <p v-if="subtitle" class="card__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="card__actions"><slot name="actions" /></div>
    </header>
    <div class="card__body" :class="{ 'is-padded': padded }"><slot /></div>
    <footer v-if="$slots.footer" class="card__foot"><slot name="footer" /></footer>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  box-shadow: var(--shadow-card);
  min-width: 0;
}
.card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--divider);
}
.card__titles {
  min-width: 0;
}
.card__title {
  margin: 0;
  font: 600 var(--fs-14)/1.4 var(--font-body);
  color: var(--text);
}
.card__subtitle {
  margin: var(--space-1) 0 0;
  font: 400 var(--fs-12)/1.4 var(--font-body);
  color: var(--text-3);
}
.card__actions {
  flex: none;
  display: flex;
  gap: var(--space-2);
}
.card__body {
  min-width: 0;
}
.card__body.is-padded {
  padding: var(--space-4);
}
.card__foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--divider);
}
</style>
