<script setup lang="ts">
/** Catalogue demo: horizontal rule with label, spacing variants, vertical separators. */
import { Divider } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-col">
      <Divider label="or continue with" :spacing="6" />
      <Divider />
      <div class="cat-row">
        <span class="cat-label">Alpha</span>
        <Divider orientation="vertical" />
        <span class="cat-label">Beta</span>
        <Divider orientation="vertical" />
        <span class="cat-label">Gamma</span>
      </div>
      <Divider label="Section" />
    </div>
  </div>
</template>
