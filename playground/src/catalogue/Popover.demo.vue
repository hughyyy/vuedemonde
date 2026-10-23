<script setup lang="ts">
/** Catalogue demo: an open anchored popover over a trigger row. */
import { onMounted, ref } from "vue";
import { AppButton, Popover } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const open = ref(false);

onMounted(() => {
  if (props.print) open.value = true;
});
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-row">
      <Popover v-model:open="open" :width="260" placement="bottom" label="Workflow actions">
        <template #trigger="{ toggle }">
          <AppButton variant="secondary" size="sm" @click="toggle">Workflow actions</AppButton>
        </template>
        <div class="cat-col">
          <span class="cat-label">popover</span>
          <AppButton size="sm" variant="ghost">Rename</AppButton>
          <AppButton size="sm" variant="ghost">Duplicate</AppButton>
          <AppButton size="sm" variant="ghost">Archive</AppButton>
        </div>
      </Popover>
      <AppButton size="sm" variant="ghost">Trigger only</AppButton>
    </div>
    <span class="cat-label">open in print — otherwise click the trigger</span>
    <div style="height: 260px" aria-hidden="true" />
  </div>
</template>
