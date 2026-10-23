<script setup lang="ts">
/** Catalogue demo: a left-hand drawer open over the page. */
import { onMounted, ref } from "vue";
import { AppButton, Drawer } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const open = ref(false);

onMounted(() => {
  if (props.print) open.value = true;
});
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-row">
      <AppButton @click="open = true">Open inspector</AppButton>
      <span class="cat-label">left / right / top / bottom</span>
    </div>
    <Drawer :open="open" title="Run inspector" side="left" :size="320" @close="open = false">
      <div class="cat-col">
        <span class="cat-label">run 4821</span>
        <span>Deploy pipeline finished in 42 s.</span>
        <AppButton size="sm" variant="ghost" @click="open = false">Close</AppButton>
      </div>
    </Drawer>
    <div style="height: 240px" aria-hidden="true" />
  </div>
</template>
