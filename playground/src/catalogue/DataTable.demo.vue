<script setup lang="ts">
/** Catalogue demo: sortable headers, status cells and a paged footer. */
import { AppChip, DataTable, type ColumnDef } from "@vuedemonde";

const columns: ColumnDef[] = [
  { field: "name", header: "Workstream", sortable: true },
  { field: "owner", header: "Owner", sortable: true },
  { field: "status", header: "Status", align: "center" },
  { field: "progress", header: "Done", align: "right", width: "72px" },
];

const rows: Record<string, unknown>[] = [
  { name: "Deploy pipeline", owner: "Ada Lovelace", status: "done", progress: "100%" },
  { name: "Token migration", owner: "Grace Hopper", status: "active", progress: "64%" },
  { name: "Search index", owner: "Alan Turing", status: "waiting", progress: "20%" },
  { name: "Billing report", owner: "Barbara Liskov", status: "blocked", progress: "5%" },
];

const tintOf = (v: unknown) =>
  v === "done" ? "ok" : v === "blocked" ? "err" : v === "waiting" ? "warn" : "run";
</script>

<template>
  <div class="cat-demo">
    <DataTable class="cat-fill" selectable :columns="columns" :data="rows" :page-size="3">
      <template #cell="{ col, value }">
        <AppChip v-if="col.field === 'status'" :tint="tintOf(value)">{{ String(value) }}</AppChip>
        <span v-else>{{ String(value) }}</span>
      </template>
    </DataTable>
  </div>
</template>
