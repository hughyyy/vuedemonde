<script setup lang="ts">
/** Catalogue demo: all four message kinds, a titled message and a dismissible one. */
import { AppMessage } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <AppMessage kind="info">Your workspace is on the free plan.</AppMessage>
      <AppMessage kind="ok" title="Deployed">Build 4821 is live on production.</AppMessage>
      <AppMessage kind="warn" title="Quota near">You have used 92% of your build minutes.</AppMessage>
      <AppMessage kind="err" title="Run failed" dismissible @close="() => {}">
        Step "migrate" exited with code 1.
      </AppMessage>
    </div>
  </div>
</template>
