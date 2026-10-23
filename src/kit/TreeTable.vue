<script setup lang="ts">
import { ref } from "vue";
import type { ColumnDef, TreeNode } from "./types";
import TreeRow from "./TreeRow.vue";

/**
 * TreeTable — hierarchical rows in table columns. The first column carries the
 * tree (chevrons + indent); other columns read `node.row[field]`.
 */

const props = withDefaults(
  defineProps<{
    columns: ColumnDef[];
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
    if (n.children?.length) {
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
  <div class="tree-table">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.field" :style="col.width ? { width: col.width } : undefined">
            {{ col.header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <TreeRow
          v-for="n in nodes"
          :key="n.id"
          :node="n"
          :level="0"
          :open="isOpen(n)"
          :overrides="overrides"
          :expand-all="expandAll"
          :columns="columns"
          :selectable="selectable"
          :selected-id="selectedId"
          @toggle="toggle($event)"
          @select="emit('select', $event)"
        />
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.tree-table {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  overflow: hidden;
  min-width: 0;
}
.tree-table table {
  width: 100%;
  border-collapse: collapse;
  font: 400 var(--fs-13)/1.4 var(--font-body);
}
.tree-table thead th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  background: var(--surface-2);
  border-bottom: 1px solid var(--line);
  font: 600 var(--fs-11)/1.4 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-3);
  white-space: nowrap;
}
</style>
