<script setup lang="ts">
/** Catalogue demo: native select — chosen, placeholder, error and disabled. */
import { ref } from "vue";
import { AppSelect, type SelectOption } from "@vuedemonde";

const project = ref("apollo");
const region = ref("");
const owner = ref("");

const projects: SelectOption[] = [
  { value: "apollo", label: "Apollo" },
  { value: "atlas", label: "Atlas" },
  { value: "beacon", label: "Beacon", disabled: true },
];
const regions: SelectOption[] = [
  { value: "eu", label: "Europe — Frankfurt" },
  { value: "us", label: "United States — Oregon" },
  { value: "ap", label: "Asia Pacific — Sydney" },
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <AppSelect v-model="project" label="Project" :options="projects" />
      <AppSelect v-model="region" label="Region" :options="regions" placeholder="Choose a region" />
      <AppSelect v-model="owner" label="Owner" :options="projects" error="Assign an owner before deploying" />
      <AppSelect v-model="project" label="Disabled" :options="projects" disabled />
    </div>
  </div>
</template>
