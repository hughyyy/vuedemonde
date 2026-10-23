<script setup lang="ts">
/** Catalogue demo: capped scroll region with themed scrollbars. */
import { ScrollArea } from "@vuedemonde";

const logLines = [
  "12:04:11  build   cached 3 layers",
  "12:04:19  build   bundle 214 kB",
  "12:04:26  test    312 passed",
  "12:04:31  test    lint clean",
  "12:04:44  deploy  canary 10%",
  "12:04:52  deploy  canary 40%",
  "12:05:03  deploy  rollout complete",
  "12:05:07  notify  #release posted",
];
</script>

<template>
  <div class="cat-demo cat-fill">
    <ScrollArea max-height="140px" class="cat-fill">
      <div class="cat-col" style="gap: 6px">
        <span v-for="line in logLines" :key="line" class="cat-label">{{ line }}</span>
      </div>
    </ScrollArea>
    <span class="cat-label">max-height 140px · overflow scrolls, 8 lines of output</span>
  </div>
</template>
