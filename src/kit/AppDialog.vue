<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import AppIcon from "./AppIcon.vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    size?: "sm" | "md" | "lg";
  }>(),
  { size: "md" },
);

const emit = defineEmits<{ close: [] }>();

const dialogEl = ref<HTMLElement | null>(null);
let prevFocus: HTMLElement | null = null;

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    e.stopPropagation();
    emit("close");
  } else if (e.key === "Tab") {
    trapFocus(e);
  }
}

function trapFocus(e: KeyboardEvent): void {
  const root = dialogEl.value;
  if (!root) return;
  const focusables = root.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!focusables.length) return;
  const first = focusables[0]!;
  const last = focusables[focusables.length - 1]!;
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      prevFocus = document.activeElement as HTMLElement | null;
      void nextTick(() => dialogEl.value?.querySelector<HTMLElement>("[autofocus], button, input")?.focus());
    } else if (prevFocus) {
      prevFocus.focus();
      prevFocus = null;
    }
  },
);

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="app-dialog__scrim" @mousedown.self="emit('close')">
      <div
        ref="dialogEl"
        class="app-dialog"
        :class="`is-${size}`"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <header class="app-dialog__head">
          <h2 class="app-dialog__title"><slot name="title">{{ title }}</slot></h2>
          <button class="app-dialog__close" type="button" aria-label="Close" @click="emit('close')">
            <AppIcon name="close" :size="14" />
          </button>
        </header>
        <div class="app-dialog__body"><slot /></div>
        <footer v-if="$slots.footer" class="app-dialog__foot"><slot name="footer" /></footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.app-dialog__scrim {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: var(--space-5);
  background: var(--overlay);
}
.app-dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: min(85vh, 720px);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  box-shadow: var(--shadow-modal);
  animation: kit-dialog-in var(--dur-2) var(--ease-out);
}
.app-dialog.is-sm {
  max-width: 360px;
}
.app-dialog.is-md {
  max-width: 560px;
}
.app-dialog.is-lg {
  max-width: 820px;
}
.app-dialog__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--divider);
}
.app-dialog__title {
  margin: 0;
  font: 600 var(--fs-15)/1.4 var(--font-body);
  color: var(--text);
}
.app-dialog__close {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
}
.app-dialog__close:hover {
  background: var(--surface-2);
  color: var(--text);
}
.app-dialog__body {
  padding: var(--space-4);
  overflow-y: auto;
}
.app-dialog__foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--divider);
}
@keyframes kit-dialog-in {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-dialog {
    animation: none;
  }
}
</style>
