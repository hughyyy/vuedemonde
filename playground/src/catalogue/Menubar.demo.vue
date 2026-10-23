<script setup lang="ts">
/** Catalogue demo: desktop menu bar with its first menu opened for the print render. */
import { onMounted, ref } from "vue";
import { Menubar, type MenubarItem } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

if (props.print) {
  // Popover panels close on window scroll/resize; the capture must not tear it down.
  const stop = (e: Event): void => e.stopImmediatePropagation();
  window.addEventListener("resize", stop, true);
  window.addEventListener("scroll", stop, true);
}

const host = ref<HTMLElement | null>(null);
const picked = ref("");

const items: MenubarItem[] = [
  {
    id: "file",
    label: "File",
    children: [
      { id: "open", label: "Open…", icon: "folder" },
      { id: "save", label: "Save", icon: "check" },
      { id: "export", label: "Export JSON", icon: "copy" },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    children: [
      { id: "undo", label: "Undo" },
      { id: "redo", label: "Redo" },
      { id: "delete", label: "Delete", icon: "trash", danger: true },
    ],
  },
  { id: "view", label: "View", icon: "eye" },
];

onMounted(() => {
  if (!props.print) return;
  host.value?.querySelector<HTMLElement>(".menubar__root")?.click();
});
</script>

<template>
  <div class="cat-demo cat-fill">
    <div ref="host" class="cat-fill">
      <Menubar :items="items" @select="(id: string) => (picked = id)" />
    </div>
    <span class="cat-label">{{ picked ? `selected: ${picked}` : "File menu open in print" }}</span>
    <div style="height: 190px" aria-hidden="true" />
  </div>
</template>
