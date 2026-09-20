<script setup lang="ts">
import { AppButton, AppDialog } from "./index";
import { confirmState, settleConfirm } from "./confirm";
</script>

<template>
  <AppDialog :open="confirmState.open" :title="confirmState.opts.title || 'Confirm'" size="sm" @close="settleConfirm(false)">
    <p class="confirm-dialog__msg">{{ confirmState.opts.message }}</p>
    <template #footer>
      <AppButton variant="ghost" @click="settleConfirm(false)">{{ confirmState.opts.cancelLabel }}</AppButton>
      <AppButton :variant="confirmState.opts.danger ? 'danger' : 'primary'" @click="settleConfirm(true)">
        {{ confirmState.opts.confirmLabel }}
      </AppButton>
    </template>
  </AppDialog>
</template>

<style scoped>
.confirm-dialog__msg {
  margin: 0;
  font: 400 var(--fs-14)/1.5 var(--font-body);
  color: var(--text-2);
}
</style>
