<script setup lang="ts">
/** Catalogue demo: hierarchical rows with extra columns, one branch expanded. */
import { ref } from "vue";
import { TreeTable, type ColumnDef, type TreeNode } from "@vuedemonde";

const columns: ColumnDef[] = [
  { field: "label", header: "Person" },
  { field: "role", header: "Role" },
  { field: "team", header: "Team" },
];

const nodes: TreeNode[] = [
  {
    id: "ada",
    label: "Ada Lovelace",
    row: { role: "Analyst", team: "Core" },
    expanded: true,
    children: [
      { id: "grace", label: "Grace Hopper", row: { role: "Engineer", team: "Platform" } },
      { id: "alan", label: "Alan Turing", row: { role: "Engineer", team: "Core" } },
    ],
  },
  {
    id: "barbara",
    label: "Barbara Liskov",
    row: { role: "Lead", team: "Platform" },
    children: [{ id: "edsger", label: "Edsger Dijkstra", row: { role: "Researcher", team: "Core" } }],
  },
];

const selected = ref("grace");
</script>

<template>
  <div class="cat-demo">
    <TreeTable
      class="cat-fill"
      :columns="columns"
      :nodes="nodes"
      selectable
      :selected-id="selected"
      @select="selected = $event"
    />
  </div>
</template>
