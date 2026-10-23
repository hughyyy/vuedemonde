<script setup lang="ts">
/** Catalogue demo: inline display values that swap to an editor on click. */
import { ref } from "vue";
import { AppInput, Inplace } from "@vuedemonde";

const title = ref("Deploy pipeline");
const owner = ref("Ada Lovelace");
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <Inplace>
        <span>{{ title }}</span>
        <template #editor>
          <AppInput v-model="title" placeholder="Workflow name" />
        </template>
      </Inplace>
      <span class="cat-label">click to edit inline</span>
    </div>
    <div class="cat-row">
      <Inplace>
        <span>{{ owner }}</span>
        <template #editor>
          <AppInput v-model="owner" placeholder="Assignee" />
        </template>
      </Inplace>
      <span class="cat-label">save or cancel from the editor row</span>
    </div>
  </div>
</template>
