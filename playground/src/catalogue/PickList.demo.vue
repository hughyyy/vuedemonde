<script setup lang="ts">
/** Catalogue demo: two-list transfer with items already on both sides. */
import { ref } from "vue";
import { PickList } from "@vuedemonde";

const source = ref(["Ada Lovelace", "Grace Hopper", "Alan Turing", "Barbara Liskov"]);
const target = ref(["Katherine Johnson"]);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill">
      <PickList v-model:source="source" v-model:target="target">
        <template #item="{ item }">{{ String(item) }}</template>
      </PickList>
    </div>
  </div>
</template>
