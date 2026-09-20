<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import AppIcon from "./AppIcon.vue";

/**
 * Drawer — generic offcanvas panel on any side, with backdrop, Esc close and
 * a focus trap. (Our shell Sidebar's overlay mode is a specialized drawer on
 * this primitive's mechanics.)
 */

const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    side?: "left" | "right" | "top" | "bottom";
    /** width for left/right, height for top/bottom. */
    size?: number;
  }>(),
  { title: "", side: "left", size: 320 },
);

const emit = defineEmits<{ close: [] }>();

const panelEl = ref<HTMLElement | null>(null);
let prevFocus: HTMLElement | null = null;

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    emit("close");
  } else if (e.key === "Tab" && panelEl.value) {
    const els = panelEl.value.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if (els.length) {
      const first = els[0]!;
      const last = els[els.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      prevFocus = document.activeElement as HTMLElement | null;
      void nextTick(() => panelEl.value?.querySelector<HTMLElement>("button, [autofocus]")?.focus());
    } else if (prevFocus) {
      prevFocus.focus();
      prevFocus = null;
    }
  },
);

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="drawer" :class="`is-${side}`">
        <div class="drawer__backdrop" @mousedown="emit('close')" />
        <section
          ref="panelEl"
          class="drawer__panel"
          :class="`is-${side}`"
          :style="side === 'top' || side === 'bottom' ? { height: size + 'px' } : { width: size + 'px' }"
          role="dialog"
          aria-modal="true"
          :aria-label="title || 'Drawer'"
        >
          <header v-if="title" class="drawer__head">
            <h2 class="drawer__title">{{ title }}</h2>
            <button class="drawer__close" type="button" aria-label="Close" @click="emit('close')">
              <AppIcon name="close" :size="14" />
            </button>
          </header>
          <div class="drawer__body"><slot /></div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer {
  position: fixed;
  inset: 0;
  z-index: 950;
}
.drawer__backdrop {
  position: absolute;
  inset: 0;
  background: var(--overlay);
}
.drawer__panel {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: var(--surface-1);
  box-shadow: var(--shadow-modal);
}
.drawer__panel.is-left {
  left: 0;
  top: 0;
  bottom: 0;
}
.drawer__panel.is-right {
  right: 0;
  top: 0;
  bottom: 0;
}
.drawer__panel.is-top {
  top: 0;
  left: 0;
  right: 0;
}
.drawer__panel.is-bottom {
  bottom: 0;
  left: 0;
  right: 0;
}
.drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--divider);
}
.drawer__title {
  margin: 0;
  font: 600 var(--fs-15)/1.4 var(--font-body);
  color: var(--text);
}
.drawer__close {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
}
.drawer__close:hover {
  background: var(--surface-2);
  color: var(--text);
}
.drawer__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--space-4);
}
/* slide transitions per side */
.drawer__panel.is-left {
  transform: translateX(-100%);
  transition: transform var(--dur-3) var(--ease-out);
}
.drawer__panel.is-right {
  transform: translateX(100%);
  transition: transform var(--dur-3) var(--ease-out);
}
.drawer__panel.is-top {
  transform: translateY(-100%);
  transition: transform var(--dur-3) var(--ease-out);
}
.drawer__panel.is-bottom {
  transform: translateY(100%);
  transition: transform var(--dur-3) var(--ease-out);
}
.drawer-enter-active .drawer__panel,
.drawer-leave-active .drawer__panel {
  transform: none;
}
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--dur-3) var(--ease-out);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .drawer__panel,
  .drawer-enter-active,
  .drawer-leave-active {
    transition: none;
  }
}
</style>
