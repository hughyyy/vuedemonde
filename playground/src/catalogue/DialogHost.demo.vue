<script setup lang="ts">
/**
 * Catalogue demo: the DynamicDialog service host.
 *
 * DialogHost only renders whatever the dialogs registry holds, so in print mode
 * we open one through the real service and leave it pending — exactly as a
 * caller sees it.
 *
 * The body is a render function, not a `template:` string: the shipped build
 * uses the runtime-only Vue compiler, where a string template silently renders
 * nothing (an empty dialog body).
 */
import { h, markRaw, onMounted } from "vue";
import { AppButton, DialogHost, openDialog } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const Body = markRaw({
  name: "DialogBody",
  render: () =>
    h("p", { style: "margin: 0" }, [
      "Reached from the ",
      h("code", "openDialog()"),
      " service — no ",
      h("code", "<AppDialog>"),
      " in the template.",
    ]),
});

function open(): void {
  openDialog({ title: "Connection settings", width: "sm", component: Body });
}

onMounted(() => {
  if (props.print) open();
});
</script>

<template>
  <div class="cat-demo">
    <AppButton @click="open">Open dialog</AppButton>
    <DialogHost />
  </div>
</template>
