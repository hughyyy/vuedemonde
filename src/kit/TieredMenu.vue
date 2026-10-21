<script setup lang="ts">
import { onBeforeUnmount, nextTick, onMounted, ref } from "vue";
import { AppIcon } from "./index";
import type { TieredItem } from "./types";

/**
 * TieredMenu — anchored menu with nested submenus that fly out to the right.
 * Wrap a trigger in the default slot.
 */

const props = withDefaults(
  defineProps<{
    items: TieredItem[];
    align?: "start" | "end";
  }>(),
  { align: "start" },
);

const emit = defineEmits<{ select: [id: string] }>();

const open = ref(false);
const wrapEl = ref<HTMLElement | null>(null);
const rootEl = ref<HTMLElement | null>(null);
const pos = ref({ top: "-9999px", left: "-9999px" });
const sub = ref<{ items: TieredItem[]; x: number; y: number; parent: string } | null>(null);

function placeSub(node: TieredItem, rowEl: HTMLElement): void {
  const root = rootEl.value!;
  const rr = root.getBoundingClientRect();
  const row = rowEl.getBoundingClientRect();
  const x0 = props.align === "start" ? rr.right : rr.left;
  let x = x0 + 2;
  let y = row.top - rr.top + rr.top - 2; // align with the row in viewport coords
  const w = 200;
  if (x + w > window.innerWidth - 8) x = Math.max(8, (props.align === "start" ? rr.left : rr.right) - w - 2);
  sub.value = { items: node.children ?? [], x, y, parent: node.id };
}

function goBack(): void {
  sub.value = null;
}

function onPick(it: TieredItem, rowEl: HTMLElement | null): void {
  if (it.children?.length) {
    if (rowEl) placeSub(it, rowEl);
    else sub.value = null;
  } else if (!it.disabled) {
    emit("select", it.id);
    close();
  }
}

function openMenu(): void {
  open.value = true;
  sub.value = null;
  void nextTick(placeRoot);
}

function close(): void {
  open.value = false;
  sub.value = null;
}

function toggle(): void {
  if (open.value) close();
  else openMenu();
}

function placeRoot(): void {
  const w = wrapEl.value!;
  const r = w.getBoundingClientRect();
  const left = props.align === "start" ? r.left : Math.max(8, r.right - 200);
  pos.value = { top: `${Math.round(r.bottom + 4)}px`, left: `${Math.round(Math.max(8, left))}px` };
}

function onGlobalDown(e: MouseEvent): void {
  if (!open.value) return;
  const t = e.target as Node;
  if (rootEl.value?.contains(t) || wrapEl.value?.contains(t)) return;
  close();
}

function onWindow(): void {
  if (open.value) close();
}

function onKeydown(e: KeyboardEvent): void {
  if (!open.value) return;
  if (e.key === "Escape") close();
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
  <span ref="wrapEl" class="tiered">
    <span role="button" tabindex="0" :aria-haspopup="'menu'" :aria-expanded="open" @click="toggle" @keydown.enter.prevent="toggle"><slot /></span>
    <Teleport to="body">
      <Transition name="menu-pop">
        <div v-if="open" ref="rootEl" class="tiered__panel" role="menu" :style="pos" @keydown.esc="close">
          <button
            v-for="it in items"
            :key="it.id"
            class="tiered__item"
            :class="{ 'is-danger': it.danger, 'is-disabled': it.disabled }"
            role="menuitem"
            @click="onPick(it, $event.currentTarget as HTMLElement)"
          >
            <AppIcon v-if="it.icon" :name="it.icon" :size="14" class="tiered__icon" />
            <span class="tiered__label">{{ it.label }}</span>
            <AppIcon v-if="it.children?.length" name="chevron-right" :size="12" class="tiered__arrow" />
          </button>
        </div>
      </Transition>
      <Transition name="menu-pop">
        <div v-if="sub" class="tiered__panel tiered__sub" role="menu" :style="{ top: sub.y + 'px', left: sub.x + 'px' }">
          <button class="tiered__item tiered__back" type="button" @click="goBack">
            <AppIcon name="chevron-left" :size="13" />
            <span class="tiered__label">Back</span>
          </button>
          <button
            v-for="it in sub.items"
            :key="it.id"
            class="tiered__item"
            :class="{ 'is-danger': it.danger, 'is-disabled': it.disabled }"
            type="button"
            @click="onPick(it, null)"
          >
            <AppIcon v-if="it.icon" :name="it.icon" :size="14" class="tiered__icon" />
            <span class="tiered__label">{{ it.label }}</span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.tiered {
  display: inline-flex;
}
.tiered__panel {
  position: fixed;
  z-index: 1200;
  min-width: 190px;
  padding: var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-overlay);
  display: flex;
  flex-direction: column;
}
.tiered__item {
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
.tiered__item:hover:not(:disabled) {
  background: var(--surface-2);
}
.tiered__item.is-danger {
  color: var(--err);
}
.tiered__item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.tiered__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tiered__arrow {
  color: var(--text-3);
  flex: none;
}
.tiered__sub {
  min-width: 190px;
}
.tiered__back {
  color: var(--text-3);
  border-bottom: 1px solid var(--divider);
  margin-bottom: var(--space-1);
}
</style>
