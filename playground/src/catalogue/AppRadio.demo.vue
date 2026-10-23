<script setup lang="ts">
/** Catalogue demo: radio group — selected option, disabled group, disabled option. */
import { ref } from "vue";
import { AppRadio, type RadioOption } from "@vuedemonde";

const plan = ref("team");
const retries = ref("twice");

const plans: RadioOption[] = [
  { value: "solo", label: "Solo" },
  { value: "team", label: "Team" },
  { value: "scale", label: "Scale" },
];
const retryOptions: RadioOption[] = [
  { value: "once", label: "Once" },
  { value: "twice", label: "Twice" },
  { value: "forever", label: "Forever", disabled: true },
];
</script>

<template>
  <div class="cat-demo">
    <AppRadio v-model="plan" label="Plan" :options="plans" />
    <AppRadio v-model="retries" label="Retry failed steps" :options="retryOptions" />
    <AppRadio v-model="plan" label="Locked choice" :options="plans" disabled />
  </div>
</template>
