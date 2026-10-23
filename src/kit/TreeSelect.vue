<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { AppIcon, Tree } from "./index";
import type { TreeNode } from "./types";

/**
 * TreeSelect — a select whose dropdown is a Tree. Self-managed open state
 * (mirrors AppMenu's popover mechanics: outside-click/scroll/esc close).
 */

const props = withDefaults(
  defineProps<{
    nodes: TreeNode[];
    modelValue?: string;
    placeholder?: string;
    width?: number;
  }>(),
  { placeholder: "Select…", width: 240 },
);

const emit = defineEmits<{ "update:modelValue": [id: string] }>();

const open = ref(false);
const triggerEl = ref<HTMLElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const pos = ref({ top: "-9999px", left: "-9999px" });

function findById(nodes: TreeNode[], id: string): TreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const hit = findById(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

const label = computed(() => (props.modelValue ? findById(props.nodes, props.modelValue)?.label ?? "" : ""));
const display = computed(() => label.value || props.placeholder);

function place(): void {
  const t = triggerEl.value;
  if (!t) return;
  const r = t.getBoundingClientRect();
  const top = r.bottom + 4;
  const left = Math.max(8, Math.min(r.left, window.innerWidth - props.width - 8));
  pos.value = { top: `${Math.round(top)}px`, left: `${Math.round(left)}px` };
}

function toggle(e: MouseEvent): void {
  e.stopPropagation();
  open.value = !open.value;
  if (open.value) place();
}

function onSelect(id: string): void {
  emit("update:modelValue", id);
  open.value = false;
}

function onGlobalDown(e: MouseEvent): void {
  if (!open.value) return;
  const t = e.target as Node;
  if (panelEl.value?.contains(t) || triggerEl.value?.contains(t)) return;
  open.value = false;
}

function onWindow(): void {
  if (open.value) open.value = false;
}

function onKeydown(e: KeyboardEvent): void {
  if (open.value && e.key === "Escape") {
    open.value = false;
    triggerEl.value?.focus();
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
  <div class="tree-select">
    <button
      ref="triggerEl"
      class="tree-select__trigger"
      type="button"
      :aria-haspopup="'listbox'"
      :aria-expanded="open"
      @click="toggle"
      @keydown.esc="onKeydown"
    >
      <span class="tree-select__value" :class="{ 'is-placeholder': !label }">{{ display }}</span>
      <AppIcon name="chevron-down" :size="13" class="tree-select__chevron" />
    </button>

    <Teleport to="body">
      <Transition name="menu-pop">
        <div v-if="open" ref="panelEl" class="tree-select__panel" role="listbox" :style="{ ...pos, width: width + 'px' }" @keydown="onKeydown">
          <Tree :nodes="nodes" expand-all selectable :selected-id="modelValue" @select="onSelect" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.tree-select {
  display: inline-flex;
  min-width: 0;
}
.tree-select__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-width: 180px;
  max-width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text);
  font: 400 var(--fs-14)/1.4 var(--font-body);
  cursor: pointer;
  transition: border-color var(--dur-1) var(--ease-out);
}
.tree-select__trigger:hover {
  border-color: var(--line-strong);
}
.tree-select__value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tree-select__value.is-placeholder {
  color: var(--text-3);
}
.tree-select__chevron {
  flex: none;
  color: var(--text-3);
}
.tree-select__panel {
  position: fixed;
  z-index: 1200;
  max-height: 320px;
  padding: var(--space-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  box-shadow: var(--shadow-overlay);
  overflow-y: auto;
}
</style>
