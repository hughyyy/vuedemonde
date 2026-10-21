<script setup lang="ts">
import { ref } from "vue";
import { AppTabs, LaneBoard, TaskBoard, type TabDef } from "@vuedemonde";
import DemoCard from "../DemoCard.vue";

defineProps<{ print?: boolean }>();

const tabs: TabDef[] = [
  { id: "task", label: "TaskBoard" },
  { id: "lane", label: "LaneBoard" },
];
const mode = ref<"task" | "lane">("task");
</script>

<template>
  <div class="wrap">
    <h2 class="sec-title">Board <span class="hint">kanban with pointer drag &amp; drop</span></h2>

    <!-- Print/catalogue: both boards render statically so each is represented
         in the image. No drags happen in a static render, so the kit's
         mount-one-at-a-time rule (drop handlers are a module singleton) is
         only enforced in interactive mode below. -->
    <template v-if="print">
      <DemoCard class="demo span-3" title="TaskBoard" desc="Column kanban — priorities, tags, assignee stacks. Renders deterministically.">
        <TaskBoard />
      </DemoCard>
      <DemoCard class="demo span-3" title="LaneBoard" desc="Horizontal lanes — cards grouped by team; same drag engine, vertical axis.">
        <LaneBoard />
      </DemoCard>
    </template>
    <DemoCard v-else class="demo span-3" title="TaskBoard / LaneBoard" desc="Both boards share one drag engine, so the catalog mounts one at a time (mount them on separate routes in real apps).">
      <AppTabs v-model="mode" :tabs="tabs" style="margin-bottom: 16px" />
      <TaskBoard v-if="mode === 'task'" />
      <LaneBoard v-else />
    </DemoCard>
  </div>
</template>

<style scoped>
.wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 14px;
  align-items: start;
}
.wrap > .sec-title {
  grid-column: 1 / -1;
}
.span-2 { grid-column: span 2; }
.span-3 { grid-column: 1 / -1; }
.sec-title {
  margin: 0 0 8px;
  font-size: var(--fs-20);
  font-weight: var(--fw-700);
}
.hint {
  font-size: var(--fs-12);
  font-weight: var(--fw-400);
  color: var(--text-3);
}
</style>
