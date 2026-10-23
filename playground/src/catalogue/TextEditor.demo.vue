<script setup lang="ts">
/** Catalogue demo: rich-text editor with formatting toolbar and initial content. */
import { ref } from "vue";
import { TextEditor } from "@vuedemonde";

const draft = ref(
  "<h2>Release notes — v0.2</h2><p>Components moved onto the <strong>design tokens</strong>, so all six themes render from the same markup.</p><ul><li>Calendar views</li><li>Board drag engine</li><li>Per-component catalogue</li></ul>",
);
</script>

<template>
  <div class="cat-demo">
    <TextEditor v-model="draft" class="cat-fill" placeholder="Write release notes…" toolbar />
  </div>
</template>
