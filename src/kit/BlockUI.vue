<script setup lang="ts">
withDefaults(
  defineProps<{
    blocked: boolean;
    message?: string;
  }>(),
  { message: "" },
);
</script>

<template>
  <div class="blockui">
    <div class="blockui__content"><slot /></div>
    <Transition name="fade">
      <div v-if="blocked" class="blockui__mask" role="status" :aria-label="message || 'Blocked'">
        <span v-if="message" class="blockui__msg">{{ message }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.blockui {
  position: relative;
}
.blockui__mask {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-items: center;
  background: var(--overlay);
  border-radius: inherit;
}
.blockui__msg {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-overlay);
  color: var(--text);
  font: 500 var(--fs-13)/1.4 var(--font-body);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur-2) var(--ease-out);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
