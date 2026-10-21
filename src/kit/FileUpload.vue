<script setup lang="ts">
import { ref } from "vue";
import { AppIcon } from "./index";

/** FileUpload — client-side drag-drop file picker with a selected list. */

const props = withDefaults(
  defineProps<{
    accept?: string;
    multiple?: boolean;
    label?: string;
    description?: string;
  }>(),
  { multiple: true, label: "Drop files here or click to browse", description: "" },
);

const emit = defineEmits<{ files: [f: File[]] }>();

const inputEl = ref<HTMLInputElement | null>(null);
const raw = ref<File[]>([]);
const dragOver = ref(false);

function add(list: FileList | null): void {
  if (!list?.length) return;
  const arr = Array.from(list);
  const next = props.multiple ? [...raw.value, ...arr] : arr.slice(0, 1);
  raw.value = next;
  emit("files", next);
}

function onDrop(e: DragEvent): void {
  dragOver.value = false;
  add(e.dataTransfer?.files ?? null);
}

function remove(i: number): void {
  raw.value = raw.value.filter((_, x) => x !== i);
  emit("files", raw.value);
}

function openPicker(): void {
  inputEl.value?.click();
}

function fmtSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
  <div class="file-upload">
    <div
      class="file-upload__zone"
      :class="{ 'is-dragover': dragOver }"
      role="button"
      tabindex="0"
      aria-label="Choose files"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
    >
      <AppIcon name="folder" :size="20" class="file-upload__icon" />
      <span class="file-upload__label">{{ label }}</span>
      <span v-if="description" class="file-upload__desc">{{ description }}</span>
    </div>
    <input ref="inputEl" class="file-upload__input" type="file" :accept="accept" :multiple="multiple" tabindex="-1" aria-hidden="true" @change="add(($event.target as HTMLInputElement).files)" />

    <ul v-if="raw.length" class="file-upload__list">
      <li v-for="(f, i) in raw" :key="i" class="file-upload__file">
        <AppIcon name="copy" :size="14" class="file-upload__file-icon" />
        <span class="file-upload__name">{{ f.name }}</span>
        <span class="file-upload__size">{{ fmtSize(f.size) }}</span>
        <button type="button" :aria-label="`Remove ${f.name}`" @click="remove(i)">
          <AppIcon name="close" :size="11" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.file-upload {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}
.file-upload__zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-5);
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  cursor: pointer;
  text-align: center;
  transition: border-color var(--dur-1) var(--ease-out), background var(--dur-1) var(--ease-out);
}
.file-upload__zone:hover,
.file-upload__zone.is-dragover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.file-upload__icon {
  color: var(--accent);
}
.file-upload__label {
  font: 500 var(--fs-13)/1.5 var(--font-body);
  color: var(--text);
}
.file-upload__desc {
  font: 400 var(--fs-12)/1.5 var(--font-body);
  color: var(--text-3);
}
.file-upload__input {
  display: none;
}
.file-upload__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.file-upload__file {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font: 400 var(--fs-12)/1.6 var(--font-body);
  color: var(--text-2);
}
.file-upload__file-icon {
  color: var(--text-3);
  flex: none;
}
.file-upload__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-upload__size {
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
.file-upload__file button {
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
}
.file-upload__file button:hover {
  color: var(--err);
}
</style>
