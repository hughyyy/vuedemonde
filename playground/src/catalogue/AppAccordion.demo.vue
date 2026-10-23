<script setup lang="ts">
/** Catalogue demo: single-expand accordion with the first item open. */
import { ref } from "vue";
import { AppAccordion, type AccordionItem } from "@vuedemonde";

const open = ref<string | null>("identity");

const items: AccordionItem[] = [
  { id: "identity", title: "Identity" },
  { id: "execution", title: "Execution" },
  { id: "outputs", title: "Outputs" },
];
</script>

<template>
  <div class="cat-demo cat-fill">
    <AppAccordion v-model="open" :items="items">
      <template #panel-identity>
        <span class="cat-label">Avatar, name, handle and role.</span>
      </template>
      <template #panel-execution>
        <span class="cat-label">Schedules and runners.</span>
      </template>
      <template #panel-outputs>
        <span class="cat-label">Logs, artifacts and exports.</span>
      </template>
    </AppAccordion>
    <span class="cat-label">first item expanded · single-expand</span>
  </div>
</template>
