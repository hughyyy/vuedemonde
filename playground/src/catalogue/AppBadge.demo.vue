<script setup lang="ts">
/** Catalogue demo: every status tint, priorities and the dot variant. */
import { AppBadge } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <AppBadge tint="neutral">neutral</AppBadge>
      <AppBadge tint="ok">ok</AppBadge>
      <AppBadge tint="warn">warn</AppBadge>
      <AppBadge tint="err">err</AppBadge>
      <AppBadge tint="run">run</AppBadge>
      <AppBadge tint="info">info</AppBadge>
      <AppBadge tint="accent">accent</AppBadge>
    </div>
    <div class="cat-row">
      <AppBadge tint="p0">P0</AppBadge>
      <AppBadge tint="p1">P1</AppBadge>
      <AppBadge tint="p2">P2</AppBadge>
      <AppBadge tint="p3">P3</AppBadge>
      <AppBadge dot tint="ok">live</AppBadge>
    </div>
  </div>
</template>
