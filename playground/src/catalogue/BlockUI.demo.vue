<script setup lang="ts">
/** Catalogue demo: blocked pane beside an interactive one. */
import { ref } from "vue";
import { BlockUI } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

/* A static render cannot be clicked, so print shows the blocked state. */
const blocked = ref(!!props.print);
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-fill">
      <span class="cat-label">blocked</span>
      <BlockUI :blocked="blocked" message="Deploying — please wait…">
        <div
          style="padding: 16px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface-2); color: var(--text-2); font-size: var(--fs-13)"
        >
          Workflow settings stay inert while a deploy is in flight.
        </div>
      </BlockUI>
    </div>
    <div class="cat-fill">
      <span class="cat-label">interactive</span>
      <BlockUI :blocked="false">
        <div
          style="padding: 16px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface-2); color: var(--text-2); font-size: var(--fs-13)"
        >
          This pane accepts input as usual.
        </div>
      </BlockUI>
    </div>
  </div>
</template>
