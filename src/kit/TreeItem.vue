<script setup lang="ts">
import AppIcon from "./AppIcon.vue";
import type { TreeNode } from "./types";

defineOptions({ name: "TreeItem" });

const props = defineProps<{
  node: TreeNode;
  level: number;
  open: boolean;
  folded: Set<string>;
  expandAll: boolean;
  selectable: boolean;
  selectedId?: string;
}>();

const emit = defineEmits<{ toggle: [id: string]; select: [id: string] }>();

function openByDefault(n: TreeNode): boolean {
  return props.expandAll || !!n.expanded;
}

function childOpen(n: TreeNode): boolean {
  if (!n.children?.length) return false;
  if (props.folded.has(n.id)) return false;
  return openByDefault(n);
}
</script>

<template>
  <div
    class="tree-item"
    role="treeitem"
    :aria-level="level + 1"
    :aria-disabled="node.disabled || undefined"
    :aria-expanded="node.children?.length ? open : undefined"
    :aria-selected="selectable && selectedId === node.id || undefined"
  >
    <div
      class="tree-item__row"
      :class="{ 'is-selected': selectable && selectedId === node.id, 'is-disabled': node.disabled }"
      :style="{ paddingLeft: node.children?.length ? 10 + level * 12 + 'px' : 26 + level * 12 + 'px' }"
      :tabindex="selectable ? 0 : undefined"
      @click="emit('select', node.id)"
      @keydown.enter.prevent="selectable && emit('select', node.id)"
      @keydown.space.prevent="selectable && emit('select', node.id)"
    >
      <button
        v-if="node.children?.length"
        class="tree-item__twist"
        type="button"
        :aria-label="open ? 'Collapse' : 'Expand'"
        @click.stop="emit('toggle', node.id)"
      >
        <AppIcon :name="open ? 'chevron-down' : 'chevron-right'" :size="13" />
      </button>
      <AppIcon v-if="node.icon" :name="node.icon" :size="15" class="tree-item__icon" />
      <span class="tree-item__label">{{ node.label }}</span>
    </div>
    <div v-if="open && node.children?.length" class="tree-item__children">
      <TreeItem
        v-for="c in node.children"
        :key="c.id"
        :node="c"
        :level="level + 1"
        :open="childOpen(c)"
        :folded="folded"
        :expand-all="expandAll"
        :selectable="selectable"
        :selected-id="selectedId"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-item__row {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: 3px var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--text);
  font: 400 var(--fs-13)/1.6 var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}
.tree-item__row:hover {
  background: var(--surface-2);
}
.tree-item__row.is-selected {
  background: var(--accent-soft);
  color: var(--accent);
}
.tree-item__row.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.tree-item__twist {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  margin: 0 2px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  flex: none;
}
.tree-item__twist:hover {
  background: var(--surface-3);
  color: var(--text);
}
.tree-item__icon {
  flex: none;
  color: var(--text-3);
}
.tree-item__label {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
