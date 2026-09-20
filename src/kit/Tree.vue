<script setup lang="ts">
import { ref } from "vue";
import type { TreeNode } from "./types";
import TreeItem from "./TreeItem.vue";

/**
 * Tree — hierarchical navigation with expand/collapse and optional selection.
 * Expansion state is local; `expandAll` opens everything (fold-set overrides).
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

const folded = ref<Set<string>>(new Set());

function openByDefault(n: TreeNode): boolean {
  return props.expandAll || !!n.expanded;
}

function isOpen(n: TreeNode): boolean {
  if (!n.children?.length) return false;
  if (folded.value.has(n.id)) return false;
  return openByDefault(n);
}

function toggle(id: string): void {
  const s = new Set(folded.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  folded.value = s;
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
      :folded="folded"
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
