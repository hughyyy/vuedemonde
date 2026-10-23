<script setup lang="ts">
/** Catalogue demo: tooltip bubbles on hover-capable triggers, one focused. */
import { onMounted, ref } from "vue";
import { AppButton, AppTooltip } from "@vuedemonde";

defineProps<{ print?: boolean }>();

const host = ref<HTMLElement | null>(null);

/* The bubble is reveal-on-hover/focus CSS, not a prop, so a static render can
 * only show it for the focused trigger — focus the bottom-placed one so the
 * bubble opens into empty space rather than over the row above. */
onMounted(() => {
  host.value?.querySelectorAll<HTMLElement>(".app-tooltip")[1]?.focus();
});
</script>

<template>
  <div class="cat-demo">
    <div ref="host" class="cat-col">
      <div class="cat-row">
        <AppTooltip text="Runs the workflow now" placement="top">
          <AppButton size="sm" variant="secondary">Run workflow</AppButton>
        </AppTooltip>
        <AppTooltip text="Saved 4 minutes ago" placement="bottom">
          <AppButton size="sm" variant="ghost">Autosaved</AppButton>
        </AppTooltip>
      </div>
      <div class="cat-row">
        <AppTooltip text="Copy to clipboard" placement="right">
          <AppButton size="sm" variant="ghost">Share link</AppButton>
        </AppTooltip>
        <AppTooltip text="Deletes the run history" placement="bottom">
          <AppButton size="sm" variant="danger">Delete run</AppButton>
        </AppTooltip>
      </div>
    </div>
    <span class="cat-label">bubble reveals on hover or keyboard focus — focus shown on “Autosaved”</span>
  </div>
</template>
