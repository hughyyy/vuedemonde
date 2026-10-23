<script setup lang="ts">
/** Catalogue demo: determinate, labelled, indeterminate and spinner variants. */
import { AppProgress } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <AppProgress :value="68" label="Uploading artefacts — 68%" />
      <AppProgress :value="12" label="Warming cache" size="sm" />
      <AppProgress label="Waiting for a runner" />
      <div class="cat-row">
        <AppProgress variant="spinner" :value="32" label="Compiling" />
        <AppProgress variant="spinner" label="Queued" size="sm" />
      </div>
    </div>
  </div>
</template>
