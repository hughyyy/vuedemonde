<script setup lang="ts">
/** Catalogue demo: paginator at both sizes, with and without ellipsis. */
import { ref } from "vue";
import { Paginator } from "@vuedemonde";

const page = ref(3);
const short = ref(0);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <span class="cat-label">long range — elided</span>
      <Paginator v-model:page="page" :page-count="12" :total="118" :page-size="10" />
    </div>
    <div class="cat-col">
      <span class="cat-label">small</span>
      <Paginator v-model:page="short" :page-count="5" :total="42" :page-size="10" size="sm" />
    </div>
  </div>
</template>
