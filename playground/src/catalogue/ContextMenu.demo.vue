<script setup lang="ts">
/** Catalogue demo: the right-click menu over a target surface. */
import { onMounted, ref } from "vue";
import { AppButton, ContextMenu, type MenuAction } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

const items: MenuAction[] = [
  { id: "open", label: "Open in new tab", icon: "folder", shortcut: "⌘↵" },
  { id: "copy", label: "Copy link", icon: "copy", shortcut: "⌘C" },
  { id: "rename", label: "Rename", icon: "edit" },
  { id: "archive", label: "Archive", icon: "inbox", disabled: true },
  { id: "delete", label: "Delete", icon: "trash", danger: true },
];

const host = ref<HTMLElement | null>(null);
const picked = ref("");

onMounted(() => {
  if (!props.print) return;
  /* The menu only exists after a real contextmenu event, so open it at the
   * trigger's position exactly as a right-click would. */
  const el = host.value?.querySelector<HTMLElement>(".context-menu");
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: r.left + 20,
      clientY: r.bottom - 6,
    }),
  );
});
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-row">
      <span ref="host">
        <ContextMenu :items="items" @select="(id: string) => (picked = id)">
          <AppButton size="sm" variant="secondary">Right-click this workflow</AppButton>
        </ContextMenu>
      </span>
      <span class="cat-label">{{ picked ? `selected: ${picked}` : "pointer-anchored panel" }}</span>
    </div>
  </div>
</template>
