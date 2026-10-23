<script setup lang="ts">
/** Catalogue demo: add-ons on the left, both sides, and the right only. */
import { ref } from "vue";
import { AppInput, InputGroup } from "@vuedemonde";

const host = ref("api.vuedemonde.dev");
const amount = ref("128");
const handle = ref("ada");
</script>

<template>
  <div class="cat-demo">
    <InputGroup>
      <template #left>https://</template>
      <AppInput v-model="host" placeholder="domain" />
    </InputGroup>
    <InputGroup>
      <template #left>eur</template>
      <AppInput v-model="amount" placeholder="0.00" />
      <template #right>.00</template>
    </InputGroup>
    <InputGroup>
      <AppInput v-model="handle" placeholder="handle" />
      <template #right>@vuedemonde.dev</template>
    </InputGroup>
  </div>
</template>
