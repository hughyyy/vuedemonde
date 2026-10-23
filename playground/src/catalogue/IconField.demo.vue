<script setup lang="ts">
/** Catalogue demo: leading and trailing icon slots around a text field. */
import { ref } from "vue";
import { AppInput, IconField } from "@vuedemonde";

const query = ref("deploy pipeline");
const due = ref("");
</script>

<template>
  <div class="cat-demo">
    <IconField icon="search" position="left">
      <AppInput v-model="query" placeholder="Search projects" />
    </IconField>
    <IconField icon="calendar" position="right">
      <AppInput v-model="due" placeholder="Due date" />
    </IconField>
    <IconField icon="users" position="left">
      <AppInput :model-value="'Ada Lovelace'" placeholder="Assignee" />
    </IconField>
  </div>
</template>
