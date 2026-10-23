<script setup lang="ts">
/** Catalogue demo: list selection — single, filterable and multiple. */
import { ref } from "vue";
import { Listbox, type SelectOption } from "@vuedemonde";

const branch = ref("main");
const target = ref("staging");
const envs = ref<string[]>(["eu-central", "us-west"]);

const branches: SelectOption[] = [
  { value: "main", label: "main" },
  { value: "release", label: "release/2.4" },
  { value: "feature", label: "feature/tokens" },
  { value: "hotfix", label: "hotfix/ci", disabled: true },
];
const deployTargets: SelectOption[] = [
  { value: "preview", label: "Preview" },
  { value: "staging", label: "Staging" },
  { value: "production", label: "Production" },
];
const regions: SelectOption[] = [
  { value: "eu-central", label: "Europe — Frankfurt" },
  { value: "us-west", label: "United States — Oregon" },
  { value: "ap-south", label: "Asia Pacific — Mumbai" },
  { value: "sa-east", label: "South America — São Paulo" },
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row" style="align-items: flex-start">
      <div>
        <div class="cat-label">Branch — single</div>
        <Listbox v-model="branch" :options="branches" />
      </div>
      <div>
        <div class="cat-label">Target — filterable</div>
        <Listbox v-model="target" :options="deployTargets" filter placeholder="Filter targets…" />
      </div>
    </div>
    <div class="cat-fill">
      <div class="cat-label">Regions — multiple</div>
      <Listbox v-model="envs" :options="regions" multiple />
    </div>
  </div>
</template>
