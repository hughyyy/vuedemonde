<script setup lang="ts">
/** Catalogue demo: toolbar with left / center / right clusters. */
import { ref } from "vue";
import { AppButton, AppSelect, Toolbar, type SelectOption } from "@vuedemonde";

const status = ref("draft");

const options: SelectOption[] = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "published", label: "Published" },
];
</script>

<template>
  <div class="cat-demo cat-fill">
    <Toolbar title="Workspace" class="cat-fill">
      <template #left>
        <AppButton size="sm" variant="ghost" icon="plus">New</AppButton>
        <AppButton size="sm" variant="ghost" icon="trash" disabled>Delete</AppButton>
      </template>
      <template #center>
        <span class="cat-label">4 selected</span>
      </template>
      <template #right>
        <AppSelect v-model="status" :options="options" placeholder="Status" />
        <AppButton size="sm" variant="secondary" icon="settings" aria-label="View settings" />
      </template>
    </Toolbar>
  </div>
</template>
