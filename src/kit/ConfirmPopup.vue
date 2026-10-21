<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { AppButton } from "./index";

/**
 * ConfirmPopup — anchored confirmation, promise-based. The consumer wraps a
 * trigger in the default slot and calls `ref.prompt()`; it resolves true/false.
 */

const props = withDefaults(
  defineProps<{
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    placement?: "bottom" | "top";
    align?: "start" | "end";
    width?: number;
  }>(),
  { confirmLabel: "Confirm", cancelLabel: "Cancel", danger: false, placement: "bottom", align: "start", width: 260 },
);

const open = ref(false);
const wrapEl = ref<HTMLElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const pos = ref<{ top: string; left: string; transform?: string }>({ top: "-9999px", left: "-9999px" });
let resolver: ((v: boolean) => void) | null = null;

function place(): void {
  const w = wrapEl.value;
  const p = panelEl.value;
  if (!w || !p) return;
  const r = w.getBoundingClientRect();
  const gap = 4;
  const top = props.placement === "bottom" ? r.bottom + gap : r.top - gap;
  let left = props.align === "start" ? r.left : r.right;
  let transform = props.align === "end" ? "translateX(-100%)" : undefined;
  const pr = p.getBoundingClientRect();
  if (left + pr.width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - pr.width - 8);
  if (left < 8) left = 8;
  const y = top + pr.height > window.innerHeight - 8 ? Math.max(8, r.top - pr.height - gap) : top;
  pos.value = { top: `${Math.round(y)}px`, left: `${Math.round(left)}px`, transform };
}

function prompt(): Promise<boolean> {
  open.value = true;
  requestAnimationFrame(place);
  const { promise, resolve } = Promise.withResolvers<boolean>();
  resolver = resolve;
  return promise;
}

function settle(v: boolean): void {
  open.value = false;
  resolver?.(v);
  resolver = null;
}

function onGlobalDown(e: MouseEvent): void {
  if (!open.value) return;
  const t = e.target as Node;
  if (panelEl.value?.contains(t) || wrapEl.value?.contains(t)) return;
  settle(false);
}

function onWindow(): void {
  if (open.value) settle(false);
}

function onKeydown(e: KeyboardEvent): void {
  if (open.value && e.key === "Escape") settle(false);
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

defineExpose({ prompt });
</script>

<template>
  <span ref="wrapEl" class="confirm-popup">
    <slot />
    <Teleport to="body">
      <Transition name="menu-pop">
        <div v-if="open" ref="panelEl" class="confirm-popup__panel" :style="pos" role="dialog" :aria-label="message">
          <p class="confirm-popup__msg">{{ message }}</p>
          <div class="confirm-popup__actions">
            <AppButton variant="ghost" size="sm" @click="settle(false)">{{ cancelLabel }}</AppButton>
            <AppButton :variant="danger ? 'danger' : 'primary'" size="sm" @click="settle(true)">{{ confirmLabel }}</AppButton>
          </div>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.confirm-popup {
  display: inline-flex;
}
.confirm-popup__panel {
  position: fixed;
  z-index: 1200;
  width: 260px;
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-overlay);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.confirm-popup__msg {
  margin: 0;
  font: 400 var(--fs-13)/1.5 var(--font-body);
  color: var(--text-2);
}
.confirm-popup__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
</style>
