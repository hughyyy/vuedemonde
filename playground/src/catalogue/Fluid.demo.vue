<script setup lang="ts">
/** Catalogue demo: Fluid stretching form controls to the full width. */
import { ref } from "vue";
import { AppInput, AppSelect, AppTextarea, Fluid, type SelectOption } from "@vuedemonde";

const name = ref("Nebula");
const visibility = ref("private");
const brief = ref("");

const options: SelectOption[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "unlisted", label: "Unlisted" },
];
</script>

<template>
  <div class="cat-demo cat-fill">
    <Fluid>
      <AppInput v-model="name" label="Project name" placeholder="e.g. nebula" />
      <AppSelect v-model="visibility" label="Visibility" :options="options" placeholder="Pick one" />
      <AppTextarea v-model="brief" label="Description" :rows="2" placeholder="What does this pipeline do?" />
    </Fluid>
    <span class="cat-label">every child spans the container width</span>
  </div>
</template>
