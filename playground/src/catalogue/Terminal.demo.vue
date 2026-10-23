<script setup lang="ts">
/** Catalogue demo: a static transport feeding real ANSI runs into the terminal. */
import { onMounted } from "vue";
import { Terminal, type TermTransport, type TermTransportApi } from "@vuedemonde";

let api: TermTransportApi | null = null;

const transport: TermTransport = {
  id: "release",
  label: "release run",
  attach(next: TermTransportApi) {
    api = next;
  },
  dispose() {},
};

onMounted(() => {
  if (!api) return;
  api.append("$ npm run release\n");
  api.append(
    "\u001b[90m▸ build 0%\u001b[0m\r\u001b[90m▸ build 47%\u001b[0m\r\u001b[90m▸ build 88%\u001b[0m\r\u001b[32m✓ build ok\u001b[0m \u001b[90min 1.84s\u001b[0m\n",
  );
  api.append("\u001b[33m▲ theme.css  18.2 kB\u001b[0m\n");
  api.append("\u001b[32m✓ kit.js     61.4 kB gzip\u001b[0m\n");
  api.append("  ➜  \u001b[36mLocal:\u001b[0m  \u001b[4mhttp://localhost:5199/\u001b[0m\n");
});
</script>

<template>
  <div class="cat-demo">
    <Terminal class="cat-fill cat-box" :transport="transport" title="release run" height="180px" :show-timestamps="false" />
    <span class="cat-label">static transport — rows are parsed ANSI runs</span>
  </div>
</template>
