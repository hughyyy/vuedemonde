<script setup lang="ts">
/** Catalogue demo: a populated column beside a collapsed one. */
import { AppChip, BoardColumn, type BoardColumnDef } from "@vuedemonde";

const building: BoardColumnDef = {
  id: "building",
  title: "Building",
  accent: "var(--run)",
  cards: [
    { id: "c1", title: "Accent runtime to settings", tags: ["ui", "U12"], priority: "P2", due: "Oct 7", assignees: [{ name: "Ari N." }] },
    { id: "c2", title: "Virtual scroller", tags: ["ui", "perf"], priority: "P1", assignees: [{ name: "Jae Doe" }, { name: "Sam West" }, { name: "M. Lee" }] },
    { id: "c3", title: "Contrast audit for low-blue themes", tags: ["a11y"], priority: "P0", due: "Oct 9", assignees: [{ name: "Sam West" }] },
  ],
};

const ready: BoardColumnDef = {
  id: "ready",
  title: "Ready",
  accent: "var(--info)",
  cards: [
    { id: "c4", title: "Artifact storage — build-own JSON", tags: ["storage"], priority: "P1", due: "Oct 5", assignees: [{ name: "M. Lee" }] },
  ],
};
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row" style="align-items: flex-start">
      <BoardColumn :column="building" :collapsed="false" @toggle-collapse="() => undefined" @add-card="() => undefined" @open="() => undefined" />
      <BoardColumn :column="ready" collapsed @toggle-collapse="() => undefined" @add-card="() => undefined" @open="() => undefined" />
    </div>
    <div class="cat-row">
      <span class="cat-label">expanded</span>
      <AppChip tint="info">collapsed — count only</AppChip>
    </div>
  </div>
</template>
