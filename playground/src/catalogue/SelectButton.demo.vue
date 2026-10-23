<script setup lang="ts">
/** Catalogue demo: segmented picker — single, multiple and a disabled option. */
import { ref } from "vue";
import { SelectButton, type SelectOption } from "@vuedemonde";

const range = ref("week");
const channels = ref<string[]>(["email", "slack"]);
const priority = ref("low");

const ranges: SelectOption[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year", disabled: true },
];
const channelOptions: SelectOption[] = [
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
  { value: "webhook", label: "Webhook" },
];
const priorities: SelectOption[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "urgent", label: "Urgent", disabled: true },
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <span class="cat-label">Single</span>
      <div class="cat-row">
        <SelectButton v-model="range" :options="ranges" />
      </div>
      <span class="cat-label">Multiple</span>
      <div class="cat-row">
        <SelectButton v-model="channels" :options="channelOptions" multiple />
      </div>
      <span class="cat-label">Disabled option</span>
      <div class="cat-row">
        <SelectButton v-model="priority" :options="priorities" />
      </div>
    </div>
  </div>
</template>
