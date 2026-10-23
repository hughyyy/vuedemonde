<script setup lang="ts">
/** Catalogue demo: content that mounts only once it scrolls near the viewport. */
import { AppButton, DeferredContent } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo cat-fill">
    <DeferredContent>
      <div class="cat-col">
        <span class="cat-label">Loaded — the panel mounted when it approached the viewport.</span>
        <div class="cat-row">
          <AppButton size="sm">Run pipeline</AppButton>
          <AppButton size="sm" variant="ghost">Inspect logs</AppButton>
        </div>
      </div>
      <template #placeholder>
        <span class="cat-label">placeholder — waiting for scroll-into-view</span>
      </template>
    </DeferredContent>
  </div>
</template>
