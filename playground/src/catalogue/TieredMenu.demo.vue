<script setup lang="ts">
/** Catalogue demo: cascade menu with a nested submenu. */
import { onMounted, ref } from "vue";
import { AppButton, TieredMenu, type TieredItem } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

if (props.print) {
  // The teleported panel closes on window scroll/resize; keep it up for the capture.
  const stop = (e: Event): void => e.stopImmediatePropagation();
  window.addEventListener("resize", stop, true);
  window.addEventListener("scroll", stop, true);
}

const host = ref<HTMLElement | null>(null);
const picked = ref("");

const items: TieredItem[] = [
  { id: "move", label: "Move to", icon: "folder", children: [{ id: "left", label: "Left column" }, { id: "right", label: "Right column" }] },
  { id: "duplicate", label: "Duplicate", icon: "copy" },
  { id: "archive", label: "Archive", icon: "inbox", children: [{ id: "inbox", label: "To inbox" }, { id: "vault", label: "To vault" }] },
  { id: "delete", label: "Delete", icon: "trash", danger: true },
];

onMounted(() => {
  if (!props.print) return;
  host.value?.querySelector<HTMLElement>("[role='button']")?.click();
});
</script>

<template>
  <div class="cat-demo cat-fill">
    <div ref="host" class="cat-row">
      <TieredMenu :items="items" @select="(id: string) => (picked = id)">
        <AppButton variant="secondary" size="sm" icon="more">Move or archive</AppButton>
      </TieredMenu>
      <span class="cat-label">{{ picked ? `selected: ${picked}` : "open in print — otherwise click the trigger" }}</span>
    </div>
    <div style="height: 220px" aria-hidden="true" />
  </div>
</template>
