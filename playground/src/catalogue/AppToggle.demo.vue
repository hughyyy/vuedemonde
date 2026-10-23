<script setup lang="ts">
/** Catalogue demo: switch — on, off and disabled. */
import { ref } from "vue";
import { AppToggle } from "@vuedemonde";

const autoDeploy = ref(true);
const telemetry = ref(false);
const locked = ref(true);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <AppToggle v-model="autoDeploy" label="Deploy on merge to main" />
      <AppToggle v-model="telemetry" label="Share anonymous usage data" />
      <AppToggle v-model="locked" label="Enforced by the organisation" disabled />
    </div>
  </div>
</template>
