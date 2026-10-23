<script setup lang="ts">
/** Catalogue demo: text entry — default, hint, error, small and disabled. */
import { ref } from "vue";
import { AppInput } from "@vuedemonde";

const name = ref("Deploy pipeline");
const slug = ref("deploy-pipeline");
const email = ref("ada.lovelace");
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <AppInput v-model="name" label="Workspace name" placeholder="Deploy pipeline" />
      <AppInput v-model="slug" label="Slug" hint="Lowercase letters, numbers and dashes" />
      <AppInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        :error="email.includes('@') ? undefined : 'Enter a full address, e.g. ada@example.com'"
      />
    </div>
    <div class="cat-row" style="align-items: flex-start; width: 100%">
      <div style="flex: 1; min-width: 0">
        <AppInput v-model="slug" label="Small" size="sm" />
      </div>
      <div style="flex: 1; min-width: 0">
        <AppInput label="Disabled" :model-value="name" disabled />
      </div>
    </div>
  </div>
</template>
