<script setup lang="ts">
import type { OrgNode } from "./types";
import OrgNodeView from "./OrgNode.vue";

/**
 * OrgChart — top-down organizational diagram with connector lines.
 */

withDefaults(
  defineProps<{
    data: OrgNode;
    selectable?: boolean;
    selectedId?: string;
  }>(),
  { selectable: false },
);

const emit = defineEmits<{ select: [id: string] }>();
</script>

<template>
  <div class="org-chart">
    <OrgNodeView :node="data" :level="0" :selectable="selectable" :selected-id="selectedId" @select="emit('select', $event)" />
  </div>
</template>

<style scoped>
.org-chart {
  display: flex;
  justify-content: center;
  padding: var(--space-4) 0;
  overflow-x: auto;
  min-width: 0;
}
</style>
