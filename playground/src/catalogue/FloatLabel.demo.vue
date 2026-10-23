<script setup lang="ts">
/** Catalogue demo: the floating label at rest and floated over a filled field. */
import { ref } from "vue";
import { AppInput, FloatLabel } from "@vuedemonde";

const empty = ref("");
const filled = ref("Ada Lovelace");
</script>

<template>
  <div class="cat-demo cat-fill">
    <FloatLabel>
      <AppInput v-model="empty" placeholder=" " />
      <template #label>Full name</template>
    </FloatLabel>
    <FloatLabel>
      <AppInput v-model="filled" placeholder=" " />
      <template #label>Assignee</template>
    </FloatLabel>
    <FloatLabel>
      <AppInput :model-value="'ada@vuedemonde.dev'" placeholder=" " disabled />
      <template #label>Locked email</template>
    </FloatLabel>
  </div>
</template>
