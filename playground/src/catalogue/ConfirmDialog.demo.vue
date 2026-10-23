<script setup lang="ts">
/**
 * Catalogue demo: the confirm() service host.
 *
 * `ConfirmDialog` has no static appearance — it renders the state of
 * `confirmState`, so the only meaningful render is an open prompt. In print mode
 * we fire the real `confirm()` call and leave the promise unsettled, exactly as
 * a caller awaiting a user decision would.
 */
import { onMounted } from "vue";
import { AppButton, ConfirmDialog, confirm } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

onMounted(() => {
  if (!props.print) return;
  void confirm({
    title: "Delete workflow",
    message: "This removes all 14 runs and cannot be undone. Continue?",
    confirmLabel: "Delete",
    cancelLabel: "Keep",
    danger: true,
  });
});
</script>

<template>
  <div class="cat-demo">
    <AppButton variant="danger" @click="() => void confirm({ title: 'Delete workflow', message: 'This cannot be undone.', danger: true })">
      Delete workflow
    </AppButton>
    <ConfirmDialog />
  </div>
</template>
