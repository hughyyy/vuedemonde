<script setup lang="ts">
/** Catalogue demo: search field with a clear affordance, both sizes and disabled. */
import { ref } from "vue";
import { AppSearchInput } from "@vuedemonde";

const query = ref("deploy pipeline");
const empty = ref("");
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <AppSearchInput v-model="query" label="Search runs" placeholder="Filter by name, branch or tag" />
      <AppSearchInput v-model="empty" label="Empty" placeholder="Nothing typed yet" />
      <AppSearchInput v-model="query" label="Compact" size="sm" placeholder="Filter rows" />
      <AppSearchInput v-model="query" aria-label="Search projects" placeholder="Labelled by aria only" />
      <AppSearchInput v-model="query" label="Disabled" disabled />
    </div>
  </div>
</template>
