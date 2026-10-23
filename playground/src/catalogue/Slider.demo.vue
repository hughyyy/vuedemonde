<script setup lang="ts">
/** Catalogue demo: range slider at a few positions and step granularities. */
import { ref } from "vue";
import { Slider } from "@vuedemonde";

const usage = ref(62);
const quiet = ref(15);
const precise = ref(0.5);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill">
      <div class="cat-label">CPU threshold — {{ usage }}%</div>
      <Slider v-model="usage" :min="0" :max="100" />
    </div>
    <div class="cat-fill">
      <div class="cat-label">Idle timeout — {{ quiet }} min (step 5)</div>
      <Slider v-model="quiet" :min="0" :max="120" :step="5" />
    </div>
    <div class="cat-fill">
      <div class="cat-label">Sample rate — {{ precise.toFixed(2) }}</div>
      <Slider v-model="precise" :min="0" :max="1" :step="0.05" />
    </div>
  </div>
</template>
