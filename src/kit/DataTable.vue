<script setup lang="ts">
import { computed, ref } from "vue";
import AppIcon from "./AppIcon.vue";
import Paginator from "./Paginator.vue";
import type { ColumnDef } from "./types";

export type { ColumnDef };

const props = withDefaults(
  defineProps<{
    columns: ColumnDef[];
    data: Record<string, unknown>[];
    pageSize?: number;
    selectable?: boolean;
    sticky?: boolean;
    /** row identity for selection/keying (defaults to index). */
    rowKey?: "string" | "number";
  }>(),
  { pageSize: 0, selectable: false, sticky: false },
);

const emit = defineEmits<{ "row-select": [row: Record<string, unknown>] }>();

const sort = ref<{ field: string; dir: "asc" | "desc" } | null>(null);
const page = ref(0);
const selectedKey = ref<string | number | null>(null);

function toggleSort(col: ColumnDef): void {
  if (!col.sortable) return;
  sort.value = sort.value?.field === col.field && sort.value.dir === "asc"
    ? { field: col.field, dir: "desc" }
    : { field: col.field, dir: "asc" };
}

const sorted = computed(() => {
  const rows = [...props.data];
  if (sort.value) {
    const s = sort.value;
    rows.sort((a, b) => {
      const av = a[s.field] ?? "";
      const bv = b[s.field] ?? "";
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return s.dir === "asc" ? cmp : -cmp;
    });
  }
  return rows;
});

const pageCount = computed(() => (props.pageSize > 0 ? Math.max(1, Math.ceil(sorted.value.length / props.pageSize)) : 1));
const paged = computed(() => (props.pageSize > 0 ? sorted.value.slice(page.value * props.pageSize, (page.value + 1) * props.pageSize) : sorted.value));

function keyOf(row: Record<string, unknown>, i: number): string | number {
  return props.rowKey ? (row[props.rowKey] as string | number) : i;
}

function rowClass(row: Record<string, unknown>, i: number): string {
  return keyOf(row, i) === selectedKey.value ? "is-selected" : "";
}

function onRow(row: Record<string, unknown>, i: number): void {
  selectedKey.value = keyOf(row, i);
  emit("row-select", row);
}
</script>

<template>
  <div class="data-table">
    <div class="data-table__scroll" :class="{ 'is-sticky': sticky }">
      <table>
        <thead>
          <tr>
            <th v-if="selectable" class="data-table__selhead" />
            <th
              v-for="col in columns"
              :key="col.field"
              class="data-table__head"
              :class="[`is-${col.align ?? 'left'}`, { 'is-sortable': col.sortable }]"
              :style="col.width ? { width: col.width } : undefined"
              @click="toggleSort(col)"
            >
              <span class="data-table__head-label">{{ col.header }}</span>
              <AppIcon
                v-if="col.sortable"
                :name="sort?.field === col.field ? (sort.dir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevron-down'"
                :size="12"
                class="data-table__sort"
                :class="{ 'is-active': sort?.field === col.field }"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in paged" :key="keyOf(row, i)" :class="rowClass(row, i)" class="data-table__row" @click="onRow(row, i)">
            <td v-if="selectable" class="data-table__sel">
              <span class="data-table__radio" :class="{ 'is-on': keyOf(row, i) === selectedKey }" />
            </td>
            <td v-for="col in columns" :key="col.field" class="data-table__cell" :class="`is-${col.align ?? 'left'}`">
              <slot name="cell" :row="row" :col="col" :value="row[col.field]" :index="i">{{ String(row[col.field] ?? "") }}</slot>
            </td>
          </tr>
          <tr v-if="!paged.length" class="data-table__empty-row">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="data-table__empty">
              <slot name="empty">No rows.</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="pageSize > 0" class="data-table__footer">
      <Paginator :page="page" :page-count="pageCount" :total="sorted.length" :page-size="pageSize" size="sm" @update:page="page = $event" />
    </div>
  </div>
</template>

<style scoped>
.data-table {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  overflow: hidden;
}
.data-table__scroll {
  overflow-x: auto;
}
.data-table__scroll.is-sticky thead {
  position: sticky;
  top: 0;
  z-index: 2;
}
.data-table table {
  width: 100%;
  border-collapse: collapse;
  font: 400 var(--fs-13)/1.4 var(--font-body);
}
.data-table thead th {
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
.data-table__head {
  user-select: none;
}
.data-table__head.is-sortable {
  cursor: pointer;
}
.data-table__head.is-sortable:hover {
  color: var(--text);
}
.data-table__head.is-right {
  text-align: right;
}
.data-table__head.is-center {
  text-align: center;
}
.data-table__head-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}
.data-table__sort {
  color: var(--text-3);
}
.data-table__sort.is-active {
  color: var(--accent);
}
.data-table__row {
  border-bottom: 1px solid var(--divider);
  cursor: pointer;
}
.data-table__row:hover {
  background: var(--surface-2);
}
.data-table__row.is-selected {
  background: var(--accent-soft);
}
.data-table td {
  padding: var(--space-2) var(--space-3);
  color: var(--text);
}
.data-table__cell.is-right,
.data-table__cell.is-center {
  text-align: inherit;
}
.data-table__cell.is-right {
  text-align: right;
}
.data-table__cell.is-center {
  text-align: center;
}
.data-table__radio {
  display: inline-grid;
  place-items: center;
  width: 15px;
  height: 15px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background: var(--surface-1);
}
.data-table__radio.is-on {
  border-color: var(--accent);
  background: var(--accent);
}
.data-table__radio.is-on::after {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: var(--radius-pill);
  background: var(--accent-ink);
}
.data-table__empty-row:hover {
  background: transparent;
  cursor: default;
}
.data-table__empty {
  text-align: center;
  color: var(--text-3);
  padding: var(--space-5) !important;
}
.data-table__footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--space-2);
  border-top: 1px solid var(--divider);
}
</style>
