<script setup lang="ts">
/** Catalogue demo: image slide strip with prev/next and dots. */
import { Carousel } from "@vuedemonde";

const slides = [0, 1, 2].map((i) => `https://picsum.photos/seed/vuedemonde${i}/400/260`);
</script>

<template>
  <div class="cat-demo cat-fill">
    <Carousel :items="slides" style="width: 420px">
      <template #item="{ item }">
        <img :src="String(item)" alt="Sample slide" style="display: block; width: 100%; border-radius: var(--radius-md)" />
      </template>
    </Carousel>
    <span class="cat-label">3 slides · prev/next and dots under the viewport</span>
  </div>
</template>
