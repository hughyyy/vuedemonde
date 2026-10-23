<script setup lang="ts">
/**
 * Catalogue demo: the DynamicDialog service host.
 *
 * Like ConfirmDialog, DialogHost's only visible state is an open dialog from
 * the live service, so in print mode we open one and leave it pending. The
 * inline body component is marked raw to avoid the "reactive Component" warning.
 */
import { markRaw, onMounted } from "vue";
import { AppButton, DialogHost, openDialog } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const Body = markRaw({
  name: "DialogBody",
  template: `<p>Reached from the <code>openDialog()</code> service — no <code>&lt;AppDialog&gt;</code> in the template.</p>`,
});

onMounted(() => {
  if (!props.print) return;
  openDialog({ title: "Connection settings", width: "sm", component: Body });
});
</script>

<template>
  <div class="cat-demo">
    <AppButton
      @click="
        () =>
          void openDialog({
            title: 'Connection settings',
            width: 'sm',
            component: Body,
          })
      "
    >
      Open dialog
    </AppButton>
    <DialogHost />
  </div>
</template>
