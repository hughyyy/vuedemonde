<script setup lang="ts">
/** Catalogue demo: the full kanban board — seven seeded columns, scrolled to the start. */
import { TaskBoard } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill cat-box" style="height: 460px">
      <TaskBoard />
    </div>
    <span class="cat-label">columns scroll horizontally — drag cards between zones</span>
  </div>
</template>
