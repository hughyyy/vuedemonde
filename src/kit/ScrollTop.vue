<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import AppIcon from "./AppIcon.vue";

/**
 * ScrollTop — floating back-to-top button that appears after a scroll threshold.
 */

const props = withDefaults(
  defineProps<{
    threshold?: number;
  }>(),
  { threshold: 240 },
);

const visible = ref(false);

function onScroll(): void {
  visible.value = window.scrollY > props.threshold;
}

function toTop(): void {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <Transition name="fade">
    <button v-if="visible" class="scroll-top" type="button" aria-label="Back to top" @click="toTop">
      <AppIcon name="chevron-up" :size="16" />
    </button>
  </Transition>
</template>

<style scoped>
.scroll-top {
  position: fixed;
  right: var(--space-5);
  bottom: var(--space-5);
  z-index: 900;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: var(--surface-1);
  color: var(--text-2);
  box-shadow: var(--shadow-overlay);
  cursor: pointer;
  transition: background var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out);
}
.scroll-top:hover {
  background: var(--surface-2);
  color: var(--text);
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
  .scroll-top {
    transition: none;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
