<script setup lang="ts">
/** Catalogue demo: checkbox — checked, unchecked, disabled states. */
import { ref } from "vue";
import { AppCheckbox } from "@vuedemonde";

const notify = ref(true);
const digest = ref(false);
const locked = ref(true);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <AppCheckbox v-model="notify" label="Email me when a deploy finishes" />
      <AppCheckbox v-model="digest" label="Include the weekly usage digest" />
      <AppCheckbox v-model="locked" label="Require approval for production" disabled />
    </div>
    <div class="cat-row">
      <AppCheckbox :model-value="false" label="Unchecked, disabled" disabled />
    </div>
  </div>
</template>
