<script setup lang="ts">
/** Catalogue demo: the modal open over its scrim, with footer actions. */
import { onMounted, ref } from "vue";
import { AppButton, AppDialog, AppInput } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const open = ref(false);
const name = ref("Deploy pipeline");

onMounted(() => {
  if (props.print) open.value = true;
});
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-row">
      <AppButton @click="open = true">Edit workflow</AppButton>
      <span class="cat-label">focus-trapped · Escape closes · sm / md / lg</span>
    </div>
    <AppDialog :open="open" title="Edit workflow" size="sm" @close="open = false">
      <div class="cat-col">
        <AppInput v-model="name" label="Name" placeholder="Workflow name" />
        <span class="cat-label">Applies to the next run only.</span>
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="open = false">Cancel</AppButton>
        <AppButton @click="open = false">Save</AppButton>
      </template>
    </AppDialog>
    <!-- The modal is fixed and vertically centred in the viewport, so the
         shot needs the height to reach it; the scrim dims the rest. -->
    <div style="height: 560px" aria-hidden="true" />
  </div>
</template>
