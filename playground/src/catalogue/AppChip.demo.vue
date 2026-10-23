<script setup lang="ts">
/** Catalogue demo: all chip tints, selected, icon and closable states. */
import { AppChip } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <AppChip>neutral</AppChip>
      <AppChip tint="accent">accent</AppChip>
      <AppChip tint="ok">ok</AppChip>
      <AppChip tint="warn">warn</AppChip>
      <AppChip tint="err">err</AppChip>
      <AppChip tint="info">info</AppChip>
      <AppChip tint="run">run</AppChip>
    </div>
    <div class="cat-row">
      <AppChip icon="star">With icon</AppChip>
      <AppChip tint="accent" selected>Selected</AppChip>
      <AppChip closable @close="() => {}">Closable</AppChip>
    </div>
  </div>
</template>
