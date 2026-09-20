<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { MenuAction, MenuItem } from "./types";
import AppIcon from "./AppIcon.vue";

const props = withDefaults(
  defineProps<{
    items: MenuItem[];
    /** Controlled mode: bind v-model to own the open state. Omit → self-managed. */
    modelValue?: boolean;
    placement?: "bottom" | "top";
    align?: "start" | "end";
    /** optional fixed panel width */
    width?: number;
  }>(),
  { modelValue: undefined, placement: "bottom", align: "start" },
);

const emit = defineEmits<{
  "update:modelValue": [open: boolean];
  select: [id: string];
}>();

const internal = ref(false);
const isOpen = computed(() => props.modelValue ?? internal.value);

function setOpen(v: boolean): void {
  if (props.modelValue !== undefined) emit("update:modelValue", v);
  else internal.value = v;
}

const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const pos = ref<{ top: string; left: string; transform?: string }>({ top: "-9999px", left: "-9999px" });
let active = -1;

function isSeparator(it: MenuItem): it is Extract<MenuItem, { separator: true }> {
  return "separator" in it;
}

function enabledActions(): { index: number; item: MenuAction }[] {
  const acc: { index: number; item: MenuAction }[] = [];
  props.items.forEach((it, i) => {
    if (!isSeparator(it) && !it.disabled) acc.push({ index: i, item: it });
  });
  return acc;
}

function focusAt(i: number): void {
  const els = panelRef.value?.querySelectorAll<HTMLElement>("[role=menuitem]");
  els?.[i]?.focus();
  active = i;
}

watch(isOpen, (v) => {
  if (v) {
    active = -1;
    void nextTick(() => {
      place();
      const first = enabledActions()[0];
      focusAt(first ? first.index : 0);
    });
  } else {
    active = -1;
  }
});

function place(): void {
  const tr = triggerRef.value;
  if (!tr) return;
  const r = tr.getBoundingClientRect();
  const gap = 4;
  const top = props.placement === "bottom" ? r.bottom + gap : r.top - gap;
  const left = props.align === "start" ? r.left : r.right;
  pos.value = { top: `${Math.round(top)}px`, left: `${Math.round(left)}px`, transform: props.align === "end" ? "translateX(-100%)" : undefined };
  requestAnimationFrame(() => {
    const p = panelRef.value;
    if (!p) return;
    const pr = p.getBoundingClientRect();
    let x = left;
    let y = top;
    if (x + pr.width > window.innerWidth - 8) x = Math.max(8, window.innerWidth - pr.width - 8);
    if (x < 8) x = 8;
    if (y + pr.height > window.innerHeight - 8) y = Math.max(8, r.top - pr.height - gap);
    if (y < 8) y = 8;
    pos.value = { top: `${Math.round(y)}px`, left: `${Math.round(x)}px` };
  });
}

function onGlobalDown(e: MouseEvent): void {
  if (!isOpen.value) return;
  const t = e.target as Node;
  if (panelRef.value?.contains(t) || triggerRef.value?.contains(t)) return;
  setOpen(false);
}

function onWindowChange(): void {
  if (isOpen.value) setOpen(false);
}

function onKeydown(e: KeyboardEvent): void {
  const acts = enabledActions();
  if (!acts.length) return;
  const cur = Math.max(0, acts.findIndex((a) => a.index === active));
  if (e.key === "ArrowDown") focusAt(acts[(cur + 1) % acts.length]!.index);
  else if (e.key === "ArrowUp") focusAt(acts[(cur - 1 + acts.length) % acts.length]!.index);
  else if (e.key === "Home") focusAt(acts[0]!.index);
  else if (e.key === "End") focusAt(acts[acts.length - 1]!.index);
  else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    const item = acts[cur];
    if (item) {
      emit("select", item.item.id);
      setOpen(false);
    }
  } else if (e.key === "Escape") {
    setOpen(false);
    triggerRef.value?.focus();
  } else if (e.key === "Tab") {
    setOpen(false);
  }
}

function toggle(e: MouseEvent): void {
  e.stopPropagation();
  setOpen(!isOpen.value);
}

function onAction(item: MenuAction): void {
  if (item.disabled) return;
  emit("select", item.id);
  setOpen(false);
}

onMounted(() => {
  document.addEventListener("mousedown", onGlobalDown);
  window.addEventListener("scroll", onWindowChange, true);
  window.addEventListener("resize", onWindowChange);
});
onUnmounted(() => {
  document.removeEventListener("mousedown", onGlobalDown);
  window.removeEventListener("scroll", onWindowChange, true);
  window.removeEventListener("resize", onWindowChange);
});
</script>

<template>
  <span class="app-menu">
    <span
      ref="triggerRef"
      class="app-menu__trigger"
      role="button"
      tabindex="0"
      :aria-haspopup="'menu'"
      :aria-expanded="isOpen"
      @click="toggle"
      @keydown.enter.prevent="setOpen(!isOpen)"
    >
      <slot />
    </span>
    <Teleport to="body">
      <Transition name="menu-pop">
        <div
          v-if="isOpen"
          ref="panelRef"
          class="app-menu__panel"
          role="menu"
          :style="{ top: pos.top, left: pos.left, transform: pos.transform ?? 'none', ...(width ? { width: width + 'px' } : {}) }"
          @keydown="onKeydown"
        >
          <template v-for="(it, i) in items" :key="it.id">
            <div v-if="isSeparator(it)" class="app-menu__sep" role="separator" />
            <button
              v-else
              class="app-menu__item"
              :class="{ 'is-danger': it.danger, 'is-disabled': it.disabled }"
              role="menuitem"
              :tabindex="i === active ? 0 : -1"
              :disabled="it.disabled"
              @click="onAction(it)"
              @pointermove="i !== active && !it.disabled && focusAt(i)"
            >
              <AppIcon v-if="it.icon" :name="it.icon" :size="15" class="app-menu__icon" />
              <span class="app-menu__label">{{ it.label }}</span>
              <AppIcon v-if="it.checked" name="check" :size="13" class="app-menu__check" />
              <span v-if="it.shortcut" class="app-menu__shortcut">{{ it.shortcut }}</span>
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.app-menu {
  display: inline-flex;
}
.app-menu__trigger {
  display: inline-flex;
  border-radius: var(--radius-md);
}
.app-menu__panel {
  position: fixed;
  z-index: 1200;
  min-width: 176px;
  max-width: 300px;
  padding: var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-overlay);
  display: flex;
  flex-direction: column;
}
.app-menu__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-13)/1.4 var(--font-body);
  text-align: left;
  cursor: pointer;
}
.app-menu__item:hover:not(:disabled),
.app-menu__item:focus-visible {
  background: var(--nav-hover-bg);
  color: var(--text);
}
.app-menu__item.is-danger {
  color: var(--err);
}
.app-menu__item.is-danger:hover:not(:disabled) {
  background: var(--err-soft);
}
.app-menu__item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.app-menu__icon {
  color: currentColor;
  opacity: 0.8;
}
.app-menu__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.app-menu__check {
  flex: none;
  color: var(--accent);
}
.app-menu__shortcut {
  color: var(--text-3);
  font-size: var(--fs-11);
}
.app-menu__sep {
  height: 1px;
  margin: var(--space-1) var(--space-2);
  background: var(--divider);
}
.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: opacity var(--dur-2) var(--ease-out), transform var(--dur-2) var(--ease-out);
}
.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
