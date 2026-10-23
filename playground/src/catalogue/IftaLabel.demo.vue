<script setup lang="ts">
/** Catalogue demo: the ifta label as placeholder, then shifted to a caption. */
import { ref } from "vue";
import { AppInput, IftaLabel } from "@vuedemonde";

const empty = ref("");
const filled = ref("Deploy pipeline");
</script>

<template>
  <div class="cat-demo cat-fill">
    <IftaLabel>
      <AppInput v-model="empty" placeholder=" " />
      <template #label>Project name</template>
    </IftaLabel>
    <IftaLabel>
      <AppInput v-model="filled" placeholder=" " />
      <template #label>Workflow</template>
    </IftaLabel>
    <IftaLabel>
      <AppInput :model-value="'Ada Lovelace'" placeholder=" " disabled />
      <template #label>Owner</template>
    </IftaLabel>
  </div>
</template>
