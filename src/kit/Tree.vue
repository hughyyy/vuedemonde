<script setup lang="ts">
import { ref } from "vue";
import type { TreeNode } from "./types";
import TreeItem from "./TreeItem.vue";

/**
 * Tree — hierarchical navigation with expand/collapse and optional selection.
 * Expansion state is local; `expandAll` opens everything (explicit toggles
 * override it — a manually folded node stays folded, a manually opened one
 * stays open even under a later `expandAll`).
 */

const props = withDefaults(
  defineProps<{
    nodes: TreeNode[];
    selectable?: boolean;
    selectedId?: string;
    expandAll?: boolean;
  }>(),
  { expandAll: false, selectable: false },
);

const emit = defineEmits<{ select: [id: string] }>();

/** Explicit open/closed override per node id; absent = follow the default. */
const overrides = ref<Map<string, boolean>>(new Map());

function openByDefault(n: TreeNode): boolean {
  return props.expandAll || !!n.expanded;
}

function findNode(id: string, list: TreeNode[]): TreeNode | null {
  for (const n of list) {
    if (n.id === id) return n;
    if (n.children) {
      const hit = findNode(id, n.children);
      if (hit) return hit;
    }
  }
  return null;
}

function isOpen(n: TreeNode): boolean {
  if (!n.children?.length) return false;
  const o = overrides.value.get(n.id);
  if (o !== undefined) return o;
  return openByDefault(n);
}

function toggle(id: string): void {
  // Flip the CURRENT state into an explicit override — toggling a
  // default-closed node must open it (a fold-only set made the first
  // expand click a no-op).
  const node = findNode(id, props.nodes);
  if (!node) return;
  const m = new Map(overrides.value);
  m.set(id, !isOpen(node));
  overrides.value = m;
}
</script>

<template>
  <div class="tree" role="tree" aria-label="Tree">
    <TreeItem
      v-for="n in nodes"
      :key="n.id"
      :node="n"
      :level="0"
      :open="isOpen(n)"
      :overrides="overrides"
      :expand-all="expandAll"
      :selectable="selectable"
      :selected-id="selectedId"
      @toggle="toggle($event)"
      @select="emit('select', $event)"
    />
  </div>
</template>

<style scoped>
.tree {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>
