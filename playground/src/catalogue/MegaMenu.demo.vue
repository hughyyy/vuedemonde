<script setup lang="ts">
/** Catalogue demo: navigation bar whose first item opens a wide multi-column panel. */
import { onMounted, ref } from "vue";
import { MegaMenu, type MegaItem } from "@vuedemonde";

const props = defineProps<{ print?: boolean }>();

if (props.print) {
  // Popover panels close on window scroll/resize; the capture must not tear it down.
  const stop = (e: Event): void => e.stopImmediatePropagation();
  window.addEventListener("resize", stop, true);
  window.addEventListener("scroll", stop, true);
}

const host = ref<HTMLElement | null>(null);
const picked = ref("");

const items: MegaItem[] = [
  {
    id: "product",
    label: "Product",
    icon: "node",
    columns: [
      {
        title: "Manage",
        items: [
          { id: "library", label: "Library", icon: "folder" },
          { id: "catalog", label: "Catalogue", icon: "inbox" },
          { id: "runs", label: "Runs", icon: "run" },
        ],
      },
      {
        title: "Observe",
        items: [
          { id: "charts", label: "Dashboards", icon: "chart" },
          { id: "alerts", label: "Alerts", icon: "bell" },
        ],
      },
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: "users",
    columns: [
      {
        title: "Explore",
        items: [
          { id: "guides", label: "Guides", icon: "info" },
          { id: "events", label: "Events", icon: "calendar" },
        ],
      },
    ],
  },
  { id: "docs", label: "Docs", icon: "document" },
];

onMounted(() => {
  if (!props.print) return;
  host.value?.querySelector<HTMLElement>(".mega__root")?.click();
});
</script>

<template>
  <div class="cat-demo cat-fill">
    <div ref="host" class="cat-fill">
      <MegaMenu :items="items" @select="(id: string) => (picked = id)" />
    </div>
    <span class="cat-label">{{ picked ? `selected: ${picked}` : "Product panel open in print" }}</span>
    <div style="height: 200px" aria-hidden="true" />
  </div>
</template>
