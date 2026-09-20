<script setup lang="ts">
import AppIcon from "./AppIcon.vue";
import type { ColumnDef, TreeNode } from "./types";

defineOptions({ name: "TreeRow" });

const props = defineProps<{
  node: TreeNode;
  level: number;
  open: boolean;
  folded: Set<string>;
  expandAll: boolean;
  columns: ColumnDef[];
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

function cellValues(n: TreeNode, cols: ColumnDef[]): { [f: string]: unknown } {
  return n.row ?? {};
}
</script>

<template>
  <tr
    class="tree-row"
    :class="{ 'is-selected': selectable && selectedId === node.id }"
    @click="emit('select', node.id)"
  >
    <td :style="{ paddingLeft: (node.children?.length ? 8 : 22) + level * 14 + 'px' }">
      <span class="tree-row__cell">
        <button
          v-if="node.children?.length"
          class="tree-row__twist"
          type="button"
          :aria-label="open ? 'Collapse' : 'Expand'"
          @click.stop="emit('toggle', node.id)"
        >
          <AppIcon :name="open ? 'chevron-down' : 'chevron-right'" :size="13" />
        </button>
        <AppIcon v-if="node.icon" :name="node.icon" :size="15" class="tree-row__icon" />
        <span class="tree-row__label">{{ node.label }}</span>
      </span>
    </td>
    <td v-for="col in columns.slice(1)" :key="col.field" class="tree-row__value">
      {{ String(cellValues(node, columns)[col.field] ?? "") }}
    </td>
  </tr>
  <TreeRow
    v-for="c in open && node.children ? node.children : []"
    :key="c.id"
    :node="c"
    :level="level + 1"
    :open="childOpen(c)"
    :folded="folded"
    :expand-all="expandAll"
    :columns="columns"
    :selectable="selectable"
    :selected-id="selectedId"
    @toggle="emit('toggle', $event)"
    @select="emit('select', $event)"
  />
</template>

<style scoped>
.tree-row {
  border-bottom: 1px solid var(--divider);
  cursor: pointer;
}
.tree-row:hover {
  background: var(--surface-2);
}
.tree-row.is-selected {
  background: var(--accent-soft);
}
.tree-row td {
  padding: var(--space-1) var(--space-3);
  color: var(--text);
  white-space: nowrap;
}
.tree-row__cell {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}
.tree-row__twist {
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
.tree-row__twist:hover {
  background: var(--surface-3);
  color: var(--text);
}
.tree-row__icon {
  flex: none;
  color: var(--text-3);
}
.tree-row__value {
  color: var(--text-2);
}
</style>
