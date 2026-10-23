<script setup lang="ts">
/** Catalogue demo: token swatch sets, the active outline and a picker trigger. */
import { ref } from "vue";
import { InputColor } from "@vuedemonde";

const accent = ref("var(--accent)");
const status = ref("var(--warn)");

/* Swatch values are theme tokens, not literals, so the same demo reads
 * correctly under every catalogue theme. */
const tokens = ["var(--accent)", "var(--ok)", "var(--warn)", "var(--err)", "var(--info)", "var(--run)", "var(--text-3)"];
const statusTokens = ["var(--ok)", "var(--warn)", "var(--err)", "var(--info)"];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <span class="cat-label">theme tokens</span>
      <InputColor v-model="accent" :swatches="tokens" />
    </div>
    <div class="cat-row">
      <span class="cat-label">status set</span>
      <InputColor v-model="status" :swatches="statusTokens" />
    </div>
    <div class="cat-row">
      <span class="cat-label">single swatch</span>
      <InputColor v-model="accent" :swatches="['var(--accent-strong)']" />
    </div>
  </div>
</template>
