<script setup lang="ts">
/** Catalogue demo: an armed confirm popup and its unarmed trigger. */
import { onMounted, ref } from "vue";
import { AppButton, ConfirmPopup } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const archive = ref<InstanceType<typeof ConfirmPopup> | null>(null);

onMounted(() => {
  if (props.print) void archive.value?.prompt();
});
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-row">
      <ConfirmPopup
        ref="archive"
        message="Archive this workflow? You can restore it for 30 days."
        confirm-label="Archive"
        danger
      >
        <AppButton size="sm" variant="ghost" danger @click="archive?.prompt()">Archive workflow</AppButton>
      </ConfirmPopup>
      <AppButton size="sm" variant="secondary">Cancel</AppButton>
    </div>
    <span class="cat-label">prompt() resolves to true or false; Escape cancels</span>
    <div style="height: 210px" aria-hidden="true" />
  </div>
</template>
