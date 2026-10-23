<script setup lang="ts">
/** Catalogue demo: the drop zone empty, with a file list, and accept-restricted. */
import { onMounted, ref } from "vue";
import { FileUpload } from "@vuedemonde";

const host = ref<HTMLElement | null>(null);
const picked = ref<string[]>([]);

/* The selected list is component-local state, so hand the input real File
 * objects through a change event — the same path a browse dialog takes. */
onMounted(() => {
  const input = host.value?.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) return;
  const dt = new DataTransfer();
  dt.items.add(new File(['{ "accent": "var(--accent)" }'], "design-tokens.json", { type: "application/json" }));
  dt.items.add(new File(["@theme { --radius-md: 6px; }"], "theme.css", { type: "text/css" }));
  Object.defineProperty(input, "files", { value: dt.files, configurable: true });
  input.dispatchEvent(new Event("change", { bubbles: true }));
});

function onFiles(f: File[]): void {
  picked.value = f.map((x) => x.name);
}
</script>

<template>
  <div class="cat-demo cat-fill">
    <FileUpload
      label="Drop assets here or browse"
      description="PNG, JSON, CSS — anything under 10 MB"
      @files="onFiles"
    />
    <div ref="host" class="cat-fill">
      <FileUpload label="Upload two files" description="The selected list appears below the zone" @files="onFiles" />
    </div>
    <FileUpload accept="image/png" :multiple="false" label="Single image only" description="accept=image/png" />
    <span class="cat-label">{{ picked.length }} selected</span>
  </div>
</template>
