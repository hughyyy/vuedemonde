<script setup lang="ts">
/** Divider — horizontal/vertical rule, optionally with a centred label. */

const props = withDefaults(
  defineProps<{
    orientation?: "horizontal" | "vertical";
    label?: string;
    spacing?: number;
  }>(),
  { orientation: "horizontal", spacing: 2 },
);

const spacingStyle = () => ({
  marginTop: `var(--space-${props.spacing})`,
  marginBottom: `var(--space-${props.spacing})`,
});
</script>

<template>
  <div v-if="props.orientation === 'vertical'" class="app-divider is-v" role="separator" />
  <div v-else class="app-divider is-h" role="separator" :style="spacingStyle()">
    <span class="app-divider__line" /><template v-if="props.label"><span class="app-divider__label">{{ props.label }}</span></template><span class="app-divider__line" />
  </div>
</template>

<style scoped>
.app-divider {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.app-divider.is-h {
  width: 100%;
}
.app-divider.is-v {
  width: 1px;
  align-self: stretch;
  background: var(--divider);
}
.app-divider__line {
  flex: 1;
  height: 1px;
  background: var(--divider);
}
.app-divider__label {
  flex: none;
  color: var(--text-3);
  font: 400 var(--fs-11)/1.6 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
</style>
