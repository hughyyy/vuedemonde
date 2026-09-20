<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { AppIcon } from "./index";
import type { MenuAction } from "./types";

/**
 * ContextMenu — right-click menu anchored at the pointer.
 * Wrap a target in the default slot.
 */

withDefaults(
  defineProps<{
    items: MenuAction[];
  }>(),
  {},
);

const emit = defineEmits<{ select: [id: string] }>();

const open = ref(false);
const panelEl = ref<HTMLElement | null>(null);
const pos = ref({ top: "0px", left: "0px" });

function onContext(e: MouseEvent): void {
  e.preventDefault();
  const left = Math.min(e.clientX, window.innerWidth - 200);
  const top = Math.min(e.clientY, window.innerHeight - 220);
  pos.value = { top: `${Math.round(top)}px`, left: `${Math.round(Math.max(4, left))}px` };
  open.value = true;
}

function onPick(it: MenuAction): void {
  if (it.disabled) return;
  emit("select", it.id);
  open.value = false;
}

function close(): void {
  open.value = false;
}

function onGlobalDown(e: MouseEvent): void {
  if (!open.value) return;
  if (panelEl.value?.contains(e.target as Node)) return;
  close();
}

function onWindow(): void {
  if (open.value) close();
}

function onKeydown(e: KeyboardEvent): void {
  if (open.value && e.key === "Escape") close();
}

onMounted(() => {
  document.addEventListener("mousedown", onGlobalDown);
  window.addEventListener("scroll", onWindow, true);
  window.addEventListener("resize", onWindow);
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onGlobalDown);
  window.removeEventListener("scroll", onWindow, true);
  window.removeEventListener("resize", onWindow);
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <span class="context-menu" @contextmenu="onContext">
    <slot />
    <Teleport to="body">
      <Transition name="menu-pop">
        <div v-if="open" ref="panelEl" class="context-menu__panel" role="menu" :style="pos" @keydown.esc="close">
          <button
            v-for="it in items"
            :key="it.id"
            class="context-menu__item"
            :class="{ 'is-danger': it.danger, 'is-disabled': it.disabled }"
            type="button"
            @click="onPick(it)"
          >
            <AppIcon v-if="it.icon" :name="it.icon" :size="14" class="context-menu__icon" />
            <span class="context-menu__label">{{ it.label }}</span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.context-menu {
  display: inline-flex;
}
.context-menu__panel {
  position: fixed;
  z-index: 1300;
  min-width: 176px;
  padding: var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-modal);
  display: flex;
  flex-direction: column;
  max-height: 260px;
  overflow-y: auto;
}
.context-menu__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-13)/1.4 var(--font-body);
  text-align: left;
  cursor: pointer;
}
.context-menu__item:hover:not(:disabled) {
  background: var(--surface-2);
}
.context-menu__item.is-danger {
  color: var(--err);
}
.context-menu__item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.context-menu__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
