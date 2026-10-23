<script setup lang="ts">
/** Catalogue demo: expanded, collapsed and disabled nodes with a selection. */
import { ref } from "vue";
import { Tree, type TreeNode } from "@vuedemonde";

const nodes: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: "folder",
    expanded: true,
    children: [
      {
        id: "kit",
        label: "kit",
        icon: "folder",
        expanded: true,
        children: [
          { id: "app-button", label: "AppButton.vue", icon: "node" },
          { id: "data-table", label: "DataTable.vue", icon: "node" },
        ],
      },
      { id: "charts", label: "charts", icon: "folder", children: [{ id: "bar-chart", label: "BarChart.vue", icon: "node" }] },
    ],
  },
  { id: "docs", label: "docs", icon: "folder", disabled: true },
];

const selected = ref("data-table");
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill">
      <Tree :nodes="nodes" selectable :selected-id="selected" @select="selected = $event" />
    </div>
  </div>
</template>
