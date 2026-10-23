<script setup lang="ts">
/** Catalogue demo: the floating back-to-top trigger, pinned inside a demo frame. */
import { ScrollTop } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo cat-fill">
    <!-- A transformed ancestor becomes the containing block of the fixed trigger,
         so the button renders inside this frame instead of the viewport corner. -->
    <div
      style="position: relative; transform: translateZ(0); width: 100%; height: 170px; border: 1px dashed var(--line); border-radius: var(--radius-md)"
    >
      <span class="cat-label" style="position: absolute; top: 12px; left: 12px; max-width: 280px">
        Reveals once the window scrolls past the threshold, then smooth-scrolls back to the top.
      </span>
      <ScrollTop :threshold="-1" />
    </div>
    <span class="cat-label">threshold -1 forces the visible state for the render</span>
  </div>
</template>
