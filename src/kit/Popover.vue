<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

/**
 * Popover — generic anchored content overlay (self-managed open unless an
 * `open` v-model is bound). Trigger via scoped #trigger slot; content = default
 * slot. Shared closing: outside mousedown, scroll, resize, Escape.
 */

const props = withDefaults(
  defineProps<{
    open?: boolean;
    placement?: "bottom" | "top";
    align?: "start" | "end";
    width?: number;
    /** accessible name for the dialog panel. */
    label?: string;
  }>(),
  { open: undefined, placement: "bottom", align: "start", width: 260 },
);

const emit = defineEmits<{ "update:open": [open: boolean] }>();

const internal = ref(false);
const isOpen = computed(() => props.open ?? internal.value);

function setOpen(v: boolean): void {
  if (props.open !== undefined) emit("update:open", v);
  else internal.value = v;
}

const wrapEl = ref<HTMLElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const pos = ref<{ top: string; left: string; transform?: string }>({ top: "-9999px", left: "-9999px" });

function place(): void {
  const w = wrapEl.value;
  if (!w) return;
  const r = w.getBoundingClientRect();
  const gap = 4;
  const top = props.placement === "bottom" ? r.bottom + gap : r.top - gap;
  const left = props.align === "start" ? r.left : r.right;
  pos.value = { top: `${Math.round(top)}px`, left: `${Math.round(left)}px`, transform: props.align === "end" ? "translateX(-100%)" : undefined };
  requestAnimationFrame(() => {
    const p = panelEl.value;
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

watch(isOpen, (v) => {
  if (v) void nextTick(place);
});

function onGlobalDown(e: MouseEvent): void {
  if (!isOpen.value) return;
  const t = e.target as Node;
  if (panelEl.value?.contains(t) || wrapEl.value?.contains(t)) return;
  setOpen(false);
}

function onWindow(): void {
  if (isOpen.value) setOpen(false);
}

function toggle(): void {
  setOpen(!isOpen.value);
}

function onPanelKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    setOpen(false);
    wrapEl.value?.focus();
  }
}

onMounted(() => {
  document.addEventListener("mousedown", onGlobalDown);
  window.addEventListener("scroll", onWindow, true);
  window.addEventListener("resize", onWindow);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onGlobalDown);
  window.removeEventListener("scroll", onWindow, true);
  window.removeEventListener("resize", onWindow);
});
</script>

<template>
  <span ref="wrapEl" class="popover" tabindex="0" @keydown.esc="setOpen(false)">
    <slot name="trigger" :toggle="toggle" :open="isOpen" />
    <Teleport to="body">
      <Transition name="menu-pop">
        <div v-if="isOpen" ref="panelEl" class="popover__panel" role="dialog" :aria-label="label" :style="{ ...pos, ...(width ? { width: width + 'px' } : {}) }" @keydown="onPanelKeydown">
          <slot />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.popover {
  display: inline-flex;
}
.popover__panel {
  position: fixed;
  z-index: 1200;
  min-width: 180px;
  max-width: 420px;
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-overlay);
}
</style>
