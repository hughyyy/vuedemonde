<script setup lang="ts">
/** Catalogue demo: multi-line text — prose, hint, error, mono and disabled. */
import { ref } from "vue";
import { AppTextarea } from "@vuedemonde";

const notes = ref("Rotate the signing key before Friday and tell the platform team.");
const empty = ref("");
const manifest = ref("job: release\nsteps:\n  - run: vue-tsc --noEmit");
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <AppTextarea v-model="notes" label="Release notes" :rows="2" placeholder="What changed?" />
      <AppTextarea
        v-model="empty"
        label="Handover"
        :rows="2"
        hint="Visible to everyone on the team"
        placeholder="Anything the next on-call should know?"
      />
      <AppTextarea
        v-model="empty"
        label="Summary"
        :rows="2"
        error="A summary is required before publishing"
        placeholder="One line that explains the change"
      />
    </div>
    <div class="cat-row" style="align-items: flex-start; width: 100%">
      <div style="flex: 1; min-width: 0">
        <AppTextarea v-model="manifest" label="Pipeline YAML" :rows="2" mono />
      </div>
      <div style="flex: 1; min-width: 0">
        <AppTextarea label="Locked" :model-value="notes" :rows="2" disabled />
      </div>
    </div>
  </div>
</template>
