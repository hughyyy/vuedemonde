<script setup lang="ts">
/** Catalogue demo: flat and raised panels with headings and an action slot. */
import { AppBadge, AppButton, AppPanel } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo cat-fill">
    <AppPanel title="Deploy pipeline" subtitle="nebula · production" elevation="raised">
      <template #actions>
        <AppBadge tint="ok" dot>healthy</AppBadge>
        <AppButton size="sm" variant="ghost" icon="more" aria-label="Pipeline actions" />
      </template>
      <span class="cat-label">Last run finished in 2m 14s across 3 stages.</span>
    </AppPanel>
    <AppPanel title="Build cache" subtitle="warm · 82% hit rate">
      <span class="cat-label">Flat elevation — the bare surface, no shadow.</span>
    </AppPanel>
  </div>
</template>
