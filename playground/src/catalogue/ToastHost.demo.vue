<script setup lang="ts">
/** Catalogue demo: live toasts — ok and err — fired from the demo's triggers. */
import { onMounted } from "vue";
import { AppButton, ToastHost, notify } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

onMounted(() => {
  if (!props.print) return;
  notify("ok", "Workflow saved");
  notify("err", "Runner connection lost");
});
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <AppButton size="sm" @click="notify('ok', 'Workflow saved')">Notify ok</AppButton>
      <AppButton size="sm" variant="secondary" @click="notify('err', 'Runner connection lost')">Notify err</AppButton>
      <AppButton size="sm" variant="ghost" @click="notify('warn', 'Token expires in 5 min')">Notify warn</AppButton>
    </div>
    <span class="cat-label">fixed top-right stack — auto-dismisses after 4 s</span>
    <ToastHost />
  </div>
</template>
