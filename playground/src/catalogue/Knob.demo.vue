<script setup lang="ts">
/** Catalogue demo: a labelled dial at three values and two sizes. */
import { ref } from "vue";
import { Knob } from "@vuedemonde";

const speed = ref(72);
const volume = ref(30);
const gain = ref(4);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <Knob v-model="speed" :min="0" :max="100" label="speed" />
      <Knob v-model="volume" :min="0" :max="100" label="volume" />
      <Knob v-model="gain" :min="0" :max="10" :step="1" label="gain" :size="84" />
    </div>
    <div class="cat-row">
      <Knob :model-value="0" :min="0" :max="100" :size="48" label="min" />
      <Knob :model-value="100" :min="0" :max="100" :size="48" label="max" />
    </div>
  </div>
</template>
