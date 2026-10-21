<script setup lang="ts">
import type { IconName } from "./icons";
import AppIcon from "./AppIcon.vue";

withDefaults(
  defineProps<{
    kind?: "info" | "ok" | "warn" | "err";
    icon?: IconName;
    dismissible?: boolean;
    title?: string;
  }>(),
  { kind: "info", dismissible: false },
);

const emit = defineEmits<{ close: [] }>();

function defaultIcon(kind: string): IconName {
  if (kind === "ok") return "check";
  if (kind === "warn") return "warn";
  if (kind === "err") return "warn";
  return "info";
}
</script>

<template>
  <div class="app-message" :class="`is-${kind}`" :role="kind === 'err' ? 'alert' : 'status'">
    <AppIcon :name="icon ?? defaultIcon(kind)" :size="15" class="app-message__icon" />
    <div class="app-message__body">
      <strong v-if="title" class="app-message__title">{{ title }}</strong>
      <div class="app-message__text"><slot /></div>
    </div>
    <button v-if="dismissible" class="app-message__close" type="button" aria-label="Dismiss" @click="emit('close')">
      <AppIcon name="close" :size="12" />
    </button>
  </div>
</template>

<style scoped>
.app-message {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: var(--surface-1);
  color: var(--text-2);
  font: 400 var(--fs-13)/1.45 var(--font-body);
}
.app-message__icon {
  margin-top: 1px;
}
.app-message__body {
  min-width: 0;
  flex: 1;
}
.app-message__title {
  font-weight: var(--fw-600);
  color: var(--text);
}
.app-message__close {
  flex: none;
  display: inline-flex;
  padding: 0;
  border: none;
  background: transparent;
  color: currentColor;
  opacity: 0.7;
  cursor: pointer;
}
.app-message__close:hover {
  opacity: 1;
}
.app-message__close:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring);
  outline-offset: 2px;
}
.is-info {
  border-color: transparent;
  background: var(--info-soft);
  color: var(--info);
}
.is-ok {
  border-color: transparent;
  background: var(--ok-soft);
  color: var(--ok);
}
.is-warn {
  border-color: transparent;
  background: var(--warn-soft);
  color: var(--warn);
}
.is-err {
  border-color: transparent;
  background: var(--err-soft);
  color: var(--err);
}
.is-warn .app-message__title,
.is-err .app-message__title {
  color: currentColor;
}
</style>
