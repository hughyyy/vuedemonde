<script setup lang="ts">
/** Catalogue demo: the task dialog open on a populated card (opens when printing). */
import { ref } from "vue";
import { AppButton, TaskDialog, type TaskCard } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const card = ref<TaskCard | null>({
  id: "dlg1",
  title: "Stream reasoning deltas",
  description: "Throttle the trace into the live output window and paint it with the accent token.",
  tags: ["runs", "ui"],
  priority: "P1",
  due: "Oct 7",
  assignees: [{ name: "Ari N." }, { name: "Sam West" }],
});

const open = ref(false);

if (props.print) open.value = true;

function applyPatch(patch: Partial<TaskCard>): void {
  if (card.value) Object.assign(card.value, patch);
}
</script>

<template>
  <div class="cat-demo">
    <TaskDialog :card="card" :open="open" @close="open = false" @update="applyPatch" />
    <div class="cat-col">
      <span class="cat-label">{{ open ? "open" : "closed — dialog opens on interaction" }}</span>
      <div class="cat-row">
        <AppButton size="sm" variant="secondary" @click="open = true">Open card</AppButton>
      </div>
    </div>
  </div>
</template>
