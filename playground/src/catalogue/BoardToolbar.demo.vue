<script setup lang="ts">
/** Catalogue demo: the board header with a summary stat strip. */
import { AppButton, BoardToolbar, type BoardStat } from "@vuedemonde";

const stats: BoardStat[] = [
  { label: "cards", value: 12 },
  { label: "shipping", value: 3, tint: "run" },
  { label: "blocked", value: 1, tint: "err" },
  { label: "done", value: 34, tint: "ok" },
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill">
      <BoardToolbar title="Q3 launch board" :stats="stats">
        <AppButton size="sm" variant="ghost" icon="settings">Filter</AppButton>
      </BoardToolbar>
    </div>
    <div class="cat-fill">
      <BoardToolbar title="Untitled board" />
    </div>
  </div>
</template>
