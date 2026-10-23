<script setup lang="ts">
/** Catalogue demo: tag chips — populated, empty and disabled. */
import { ref } from "vue";
import { InputTags } from "@vuedemonde";

const labels = ref(["release", "platform", "needs-review"]);
const empty = ref<string[]>([]);
const locked = ref(["billing", "read-only"]);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <div class="cat-label">Populated</div>
      <InputTags v-model="labels" aria-label="Release labels" />
      <div class="cat-label">Empty</div>
      <InputTags v-model="empty" placeholder="Add a tag and press Enter" />
      <div class="cat-label">Disabled</div>
      <InputTags v-model="locked" disabled />
    </div>
  </div>
</template>
