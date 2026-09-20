<script setup lang="ts">
import { toasts, dismiss } from "./toasts";
import AppMessage from "./AppMessage.vue";

/** Fixed top-right stack of notifications (spec §4.2 Toast). Mount once in App. */
</script>

<template>
  <Teleport to="body">
    <div class="toast-host" aria-live="polite">
      <AppMessage
        v-for="t in toasts"
        :key="t.id"
        :kind="t.kind"
        dismissible
        class="toast-host__item"
        @close="dismiss(t.id)"
      >
        {{ t.message }}
      </AppMessage>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: min(360px, calc(100vw - 32px));
  pointer-events: none;
}
.toast-host__item {
  pointer-events: auto;
  box-shadow: var(--shadow-overlay);
  animation: kit-toast-in var(--dur-2) var(--ease-out);
}
@keyframes kit-toast-in {
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .toast-host__item {
    animation: none;
  }
}
</style>
