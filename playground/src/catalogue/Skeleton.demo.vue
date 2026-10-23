<script setup lang="ts">
/** Catalogue demo: circle, box and multi-line text placeholders. */
import { Skeleton } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <Skeleton shape="circle" width="40px" height="40px" />
      <Skeleton shape="box" width="120px" height="60px" />
      <Skeleton shape="circle" width="24px" height="24px" />
    </div>
    <div class="cat-col">
      <Skeleton shape="text" :lines="3" width="320px" />
      <Skeleton shape="text" :lines="2" width="220px" />
      <Skeleton shape="box" width="100%" height="28px" />
    </div>
  </div>
</template>
