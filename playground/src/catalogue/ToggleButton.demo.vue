<script setup lang="ts">
/** Catalogue demo: toggle button — pressed, unpressed and disabled. */
import { ref } from "vue";
import { ToggleButton } from "@vuedemonde";

const pinned = ref(true);
const watching = ref(false);
const starred = ref(true);
const locked = ref(true);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <ToggleButton v-model="pinned" label="Pinned" />
      <ToggleButton v-model="watching" label="Watch" />
      <ToggleButton v-model="starred" label="Starred" />
    </div>
    <div class="cat-row">
      <ToggleButton v-model="locked" label="Locked on" disabled />
      <ToggleButton :model-value="false" label="Locked off" disabled />
    </div>
  </div>
</template>
