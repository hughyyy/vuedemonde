<script setup lang="ts">
/** Catalogue demo: wizard steps with the middle step active and action buttons. */
import { ref } from "vue";
import { AppButton, Stepper, type StepperItem } from "@vuedemonde";

const step = ref("review");

const steps: StepperItem[] = [
  { id: "details", label: "Details" },
  { id: "review", label: "Review", optional: true },
  { id: "deploy", label: "Deploy" },
];
</script>

<template>
  <div class="cat-demo cat-fill">
    <Stepper v-model="step" :steps="steps" class="cat-fill">
      <template #step-details>
        <span class="cat-label">Name, owner and schedule.</span>
      </template>
      <template #step-review>
        <span class="cat-label">Review the summary before deploying.</span>
      </template>
      <template #step-deploy>
        <span class="cat-label">Deploy to production.</span>
      </template>
      <template #actions>
        <AppButton size="sm" variant="secondary" @click="step = 'details'">Back</AppButton>
        <AppButton size="sm" @click="step = 'deploy'">Continue</AppButton>
      </template>
    </Stepper>
  </div>
</template>
