<script setup lang="ts">
/** Catalogue demo: free-text field over a known option list, filtered live. */
import { ref } from "vue";
import { AppOptionInput } from "@vuedemonde";

/** Not barrel-exported by the kit — mirror the component's option shape. */
type AppOption = { value: string; label?: string; hint?: string };

const assignee = ref("a");
const project = ref("");
const locked = ref("ada");

const people: AppOption[] = [
  { value: "ada", label: "Ada Lovelace", hint: "Platform" },
  { value: "alan", label: "Alan Turing", hint: "Research" },
  { value: "katherine", label: "Katherine Johnson", hint: "Data" },
];
const projects: AppOption[] = [
  { value: "apollo", label: "Apollo" },
  { value: "atlas", label: "Atlas" },
  { value: "beacon", label: "Beacon" },
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill">
      <AppOptionInput
        v-model="assignee"
        :options="people"
        label="Assignee — filtered by “a”"
        placeholder="Pick or type a name"
      />
    </div>
    <div class="cat-row" style="align-items: flex-start; width: 100%">
      <div style="flex: 1; min-width: 0">
        <AppOptionInput v-model="project" :options="projects" label="Project" placeholder="Any project" />
      </div>
      <div style="flex: 1; min-width: 0">
        <AppOptionInput v-model="locked" :options="people" label="Disabled" disabled />
      </div>
    </div>
  </div>
</template>
