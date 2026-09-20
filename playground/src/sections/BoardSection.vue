<script setup lang="ts">
import { ref } from "vue";
import { AppTabs, LaneBoard, TaskBoard, type TabDef } from "@vuedemond";

const tabs: TabDef[] = [
  { id: "task", label: "TaskBoard" },
  { id: "lane", label: "LaneBoard" },
];
const mode = ref<"task" | "lane">("task");
</script>

<template>
  <div>
    <h2 class="sec-title">Board <span class="hint">kanban with pointer drag &amp; drop</span></h2>

    <p class="note">
      Both boards share one drag engine; the catalog mounts one at a time so their
      drop handlers don't collide (mount them on separate routes in real apps).
    </p>

    <div class="board-card">
      <AppTabs v-model="mode" :tabs="tabs" style="margin-bottom: 16px" />
      <TaskBoard v-if="mode === 'task'" />
      <LaneBoard v-else />
    </div>
  </div>
</template>

<style scoped>
.sec-title {
  margin: 0 0 8px;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.note {
  font-size: var(--fs-12);
  color: var(--text-3);
  margin: 0 0 16px;
}
.hint {
  font-size: var(--fs-12);
  font-weight: var(--fw-400);
  color: var(--text-3);
}
.board-card {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  padding: 16px;
  overflow: auto;
}
</style>
