<script setup lang="ts">
/** Catalogue demo: cards at three priorities — tags, due dates and assignee stacks. */
import { BoardCard, type TaskCard } from "@vuedemonde";

const cards: TaskCard[] = [
  {
    id: "k1",
    title: "Stream reasoning deltas",
    tags: ["runs", "ui"],
    priority: "P1",
    due: "Oct 7",
    assignees: [{ name: "Ari N." }, { name: "Sam West" }, { name: "Jae Doe" }],
  },
  {
    id: "k2",
    title: "Mock Jira and Confluence APIs",
    tags: ["external", "A1"],
    priority: "P0",
    assignees: [{ name: "M. Lee" }],
  },
  { id: "k3", title: "Export run transcripts as markdown", tags: [], priority: "P3", due: "Sep 30", assignees: [] },
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row" style="align-items: flex-start">
      <div v-for="card in cards" :key="card.id" style="width: 232px">
        <BoardCard :card="card" zone-id="building" @open="() => undefined" />
      </div>
    </div>
    <span class="cat-label">P1 · P0 · P3 — tags, due date and assignee stack vary</span>
  </div>
</template>
