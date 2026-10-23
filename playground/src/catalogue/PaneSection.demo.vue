<script setup lang="ts">
/** Catalogue demo: collapsible pane headers, one open and one collapsed. */
import { onMounted, ref } from "vue";
import { AppInput, PaneSection } from "@vuedemonde";

const filter = ref("");
const host = ref<HTMLElement | null>(null);

// PaneSection owns its collapse state; click the second header so the shot
// shows both an expanded and a collapsed section.
onMounted(() => {
  host.value?.querySelectorAll<HTMLElement>(".pane-section-head")[1]?.click();
});
</script>

<template>
  <div ref="host" class="cat-demo cat-fill">
    <PaneSection title="Filters">
      <AppInput v-model="filter" placeholder="Filter by owner" size="sm" />
      <span class="cat-label">Status, owner and tag filters live here.</span>
    </PaneSection>
    <PaneSection title="Saved views">
      <span class="cat-label">Collapsed — click the header to expand.</span>
    </PaneSection>
  </div>
</template>
