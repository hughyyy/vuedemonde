<script setup lang="ts">
/** Catalogue demo: horizontal lanes grouped by team, each with its own stat strip. */
import { LaneBoard } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill cat-box" style="height: 460px">
      <LaneBoard />
    </div>
    <span class="cat-label">lanes scroll vertically, cards within a lane scroll horizontally</span>
  </div>
</template>
