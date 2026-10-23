<script setup lang="ts">
/** Catalogue demo: grouped container, expanded and collapsed. */
import { ref } from "vue";
import { AppInput, Fieldset } from "@vuedemonde";

const generalOpen = ref(true);
const advancedOpen = ref(false);
const owner = ref("Ada Lovelace");
</script>

<template>
  <div class="cat-demo cat-fill">
    <Fieldset legend="General" toggleable v-model:open="generalOpen">
      <AppInput v-model="owner" label="Owner" placeholder="Who is responsible" />
    </Fieldset>
    <Fieldset legend="Advanced" toggleable v-model:open="advancedOpen">
      <span class="cat-label">Retries, timeouts and concurrency — collapsed to its legend.</span>
    </Fieldset>
  </div>
</template>
