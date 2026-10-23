<script setup lang="ts">
/** Catalogue demo: a resolved path, an empty trigger and the open breadcrumb panel. */
import { onMounted, ref } from "vue";
import { CascadeSelect } from "@vuedemonde";

/** Shape of a cascade option; the component declares it locally (not re-exported). */
type CascadeOption = { value: string; label: string; children?: CascadeOption[] };

const props = defineProps<{ print?: boolean }>();

const options: CascadeOption[] = [
  {
    value: "platform",
    label: "Platform",
    children: [
      {
        value: "compute",
        label: "Compute",
        children: [
          { value: "runners", label: "Runners" },
          { value: "workers", label: "Workers" },
        ],
      },
      { value: "storage", label: "Storage" },
    ],
  },
  {
    value: "product",
    label: "Product",
    children: [
      { value: "design", label: "Design" },
      { value: "research", label: "Research" },
    ],
  },
];

const picked = ref("workers");
const blank = ref("");
const host = ref<HTMLElement | null>(null);

if (props.print) {
  for (const type of ["scroll", "resize"] as const) {
    window.addEventListener(type, (e) => e.stopImmediatePropagation(), true);
  }
}

onMounted(() => {
  if (!props.print) return;
  host.value?.querySelector<HTMLElement>(".cascade-select__trigger")?.click();
});
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <CascadeSelect v-model="picked" :options="options" placeholder="Choose a path" />
      <CascadeSelect v-model="blank" :options="options" placeholder="Unset" />
    </div>
    <div class="cat-row">
      <span class="cat-label">open panel — drill down through the breadcrumb</span>
    </div>
    <div ref="host" class="cat-row">
      <CascadeSelect v-model="blank" :options="options" placeholder="Pick a component" />
    </div>
    <div style="height: 200px" aria-hidden="true" />
  </div>
</template>
