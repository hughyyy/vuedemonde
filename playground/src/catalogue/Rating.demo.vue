<script setup lang="ts">
/** Catalogue demo: interactive rating at three values plus a readonly summary. */
import { ref } from "vue";
import { Rating } from "@vuedemonde";

const full = ref(5);
const half = ref(3);
const none = ref(0);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <Rating v-model="full" :max="5" />
      <span class="cat-label">{{ full }}/5</span>
    </div>
    <div class="cat-row">
      <Rating v-model="half" :max="5" />
      <span class="cat-label">{{ half }}/5</span>
    </div>
    <div class="cat-row">
      <Rating v-model="none" :max="5" />
      <Rating :model-value="4" :max="10" readonly />
      <span class="cat-label">readonly, 10 stars</span>
    </div>
  </div>
</template>
