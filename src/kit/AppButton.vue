<script setup lang="ts">
import type { IconName } from "./icons";
import AppIcon from "./AppIcon.vue";

withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md";
    loading?: boolean;
    disabled?: boolean;
    icon?: IconName;
    type?: "button" | "submit";
    title?: string;
  }>(),
  {
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    type: "button",
  },
);

defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <button
    class="app-button"
    :class="[`is-${variant}`, `is-${size}`]"
    :type="type"
    :disabled="disabled || loading"
    :title="title"
    @click="$emit('click', $event)"
  >
    <AppIcon v-if="loading" name="spinner" class="is-spin" :size="size === 'sm' ? 13 : 15" />
    <AppIcon v-else-if="icon" :name="icon" :size="size === 'sm' ? 13 : 15" />
    <span v-if="$slots.default" class="app-button__label"><slot /></span>
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font: 500 var(--fs-13)/1.4 var(--font-body);
  cursor: pointer;
  transition: background var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out),
    color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
  white-space: nowrap;
}
.app-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.app-button.is-sm {
  padding: var(--space-1) var(--space-2);
  font-size: var(--fs-12);
}
.app-button.is-md {
  padding: var(--space-2) var(--space-3);
}

/* primary — accent gradient (U12 scope) with readable ink */
.app-button.is-primary {
  background: var(--accent-gradient);
  color: var(--accent-ink);
}
.app-button.is-primary:not(:disabled):hover {
  background: var(--accent-strong);
}

/* secondary — quiet surface + hairline */
.app-button.is-secondary {
  background: var(--surface-2);
  border-color: var(--line);
  color: var(--text);
}
.app-button.is-secondary:not(:disabled):hover {
  background: var(--surface-3);
  border-color: var(--line-strong);
}

/* ghost — borderless */
.app-button.is-ghost {
  background: transparent;
  color: var(--text-2);
}
.app-button.is-ghost:not(:disabled):hover {
  background: var(--surface-2);
  color: var(--text);
}

/* danger — destructive */
.app-button.is-danger {
  background: var(--err-soft);
  border-color: transparent;
  color: var(--err);
}
.app-button.is-danger:not(:disabled):hover {
  background: var(--err);
  color: var(--bg);
}

.app-button__label {
  display: inline-flex;
  align-items: center;
}
.is-spin {
  animation: kit-spin 0.8s linear infinite;
}
@keyframes kit-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .is-spin {
    animation-duration: 1.6s;
  }
}
</style>
