<script setup lang="ts">
/** Catalogue demo: thumbnail grid that opens a lightbox viewer. */
import { MediaGallery } from "@vuedemonde";

const images = [0, 1, 2, 3].map((i) => ({
  src: `https://picsum.photos/seed/vuedemonde${i}/400/260`,
  alt: `Run screenshot ${i + 1}`,
}));
</script>

<template>
  <div class="cat-demo cat-fill">
    <MediaGallery :images="images" class="cat-fill" />
    <span class="cat-label">4 thumbnails · click one to open the lightbox</span>
  </div>
</template>
