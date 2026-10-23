<script setup lang="ts">
/** Catalogue demo: anchored action menu, opened for the print render. */
import { onMounted, ref } from "vue";
import { AppButton, AppMenu, type MenuItem } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

if (props.print) {
  // The panel closes on window scroll/resize; the capture must not tear it down.
  const stop = (e: Event): void => e.stopImmediatePropagation();
  window.addEventListener("resize", stop, true);
  window.addEventListener("scroll", stop, true);
}

const open = ref(false);
const picked = ref("");

const items: MenuItem[] = [
  { id: "new", label: "New pipeline", icon: "plus", shortcut: "⌘N" },
  { id: "edit", label: "Edit", icon: "edit", shortcut: "⌘E" },
  { id: "duplicate", label: "Duplicate", icon: "copy" },
  { id: "sep", separator: true },
  { id: "archive", label: "Archive", icon: "inbox", disabled: true },
  { id: "delete", label: "Delete", icon: "trash", danger: true },
];

onMounted(() => {
  if (props.print) open.value = true;
});
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-row">
      <AppMenu v-model="open" :items="items" :width="230" @select="(id: string) => (picked = id)">
        <AppButton variant="secondary" size="sm" icon="more">Actions</AppButton>
      </AppMenu>
      <span class="cat-label">{{ picked ? `selected: ${picked}` : "open in print — otherwise click the trigger" }}</span>
    </div>
    <div style="height: 230px" aria-hidden="true" />
  </div>
</template>
