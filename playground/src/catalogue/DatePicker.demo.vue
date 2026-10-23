<script setup lang="ts">
/** Catalogue demo: empty trigger, chosen date, and the open month panel. */
import { onMounted, ref } from "vue";
import { DatePicker } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const chosen = ref("2026-10-15");
const blank = ref("");
const host = ref<HTMLElement | null>(null);

if (props.print) {
  // The panel closes on window scroll/resize; the renderer scrolls the shot
  // into view, so swallow those events before the kit's listener sees them.
  for (const type of ["scroll", "resize"] as const) {
    window.addEventListener(type, (e) => e.stopImmediatePropagation(), true);
  }
}

onMounted(() => {
  if (!props.print) return;
  host.value?.querySelector<HTMLElement>(".date-picker__trigger")?.click();
});
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <DatePicker v-model="chosen" />
      <DatePicker v-model="blank" placeholder="No date" />
    </div>
    <div class="cat-row">
      <span class="cat-label">month panel — opens below the trigger</span>
    </div>
    <div ref="host" class="cat-row">
      <DatePicker v-model="blank" placeholder="Pick a delivery date" />
    </div>
  </div>
</template>
