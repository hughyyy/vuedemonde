<script setup lang="ts">
/** Catalogue demo: a tree-backed select with a value picked (panel opens in print). */
import { nextTick, onMounted, ref } from "vue";
import { TreeSelect, type TreeNode } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const nodes: TreeNode[] = [
  {
    id: "services",
    label: "services",
    icon: "folder",
    children: [
      { id: "deploy", label: "Deploy pipeline", icon: "node" },
      { id: "search", label: "Search index", icon: "node" },
      { id: "billing", label: "Billing report", icon: "node" },
    ],
  },
  { id: "docs", label: "docs", icon: "folder", children: [{ id: "runbook", label: "Runbook.md", icon: "node" }] },
];

const selected = ref("search");
const trigger = ref<HTMLElement | null>(null);

if (props.print) {
  // The kit panel closes on window scroll/resize; the renderer resizes and
  // scrolls around the capture, so keep the open state alive.
  for (const type of ["scroll", "resize"] as const) {
    window.addEventListener(type, (e) => e.stopImmediatePropagation(), true);
  }
}

onMounted(async () => {
  if (!props.print) return;
  await nextTick();
  trigger.value?.querySelector<HTMLElement>(".tree-select__trigger")?.click();
});
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <span class="cat-label">picked value — full tree</span>
      <div ref="trigger" class="cat-fill">
        <TreeSelect v-model="selected" :nodes="nodes" placeholder="Choose a node" :width="260" />
      </div>
    </div>
    <div class="cat-col">
      <span class="cat-label">placeholder</span>
      <TreeSelect :nodes="nodes" placeholder="Choose a node" :width="200" />
    </div>
  </div>
</template>
