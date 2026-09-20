<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { AppIcon } from "./index";
import type { IconName } from "./icons";

/**
 * TextEditor — lean rich-text editor (contenteditable + toolbar) on the kit.
 * Emits HTML via `update:modelValue`. Self-built, no editing-library
 * dependency (a full block/markdown editor model is a separate Pro-family
 * effort).
 */

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    toolbar?: boolean;
  }>(),
  { placeholder: "Write something…", toolbar: true },
);

const emit = defineEmits<{ "update:modelValue": [html: string] }>();

const el = ref<HTMLElement | null>(null);
const focused = ref(false);

type Cmd = { id: string; icon?: IconName; label: string; cmd: string; value?: string };
const COMMANDS: Cmd[] = [
  { id: "b", label: "Bold", icon: "edit", cmd: "bold" },
  { id: "i", label: "Italic", icon: "theme", cmd: "italic" },
  { id: "u", label: "Underline", icon: "copy", cmd: "underline" },
  { id: "h1", label: "Heading 1", cmd: "formatBlock", value: "H1" },
  { id: "h2", label: "Heading 2", cmd: "formatBlock", value: "H2" },
  { id: "ul", label: "Bullet list", cmd: "insertUnorderedList" },
  { id: "ol", label: "Numbered list", cmd: "insertOrderedList" },
  { id: "quote", label: "Quote", cmd: "formatBlock", value: "BLOCKQUOTE" },
  { id: "code", label: "Code", icon: "copy", cmd: "formatBlock", value: "PRE" },
  { id: "link", label: "Link", icon: "question", cmd: "createLink" },
  { id: "clear", label: "Clear formatting", cmd: "removeFormat" },
];

function run(c: Cmd): void {
  if (c.cmd === "createLink") {
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    document.execCommand("createLink", false, url);
    return;
  }
  document.execCommand(c.cmd, false, c.value ?? undefined);
  el.value?.focus();
  sync();
}

function onInput(): void {
  sync();
}

function sync(): void {
  if (el.value) emit("update:modelValue", el.value.innerHTML);
}

onMounted(() => {
  if (el.value) el.value.innerHTML = props.modelValue;
});

watch(
  () => props.modelValue,
  (v) => {
    if (el.value && !focused.value && el.value.innerHTML !== v) el.value.innerHTML = v;
  },
);

defineExpose({ focus: () => el.value?.focus() });
</script>

<template>
  <div class="text-editor">
    <div v-if="toolbar" class="text-editor__toolbar">
      <button
        v-for="c in COMMANDS"
        :key="c.id"
        class="text-editor__btn"
        type="button"
        :aria-label="c.label"
        :title="c.label"
        @mousedown.prevent
        @click="run(c)"
      >
        <AppIcon v-if="c.icon" :name="c.icon" :size="13" />
        <template v-else>{{ c.label.slice(0, 2) }}</template>
      </button>
    </div>
    <div
      ref="el"
      class="text-editor__body"
      contenteditable="true"
      role="textbox"
      :aria-label="placeholder"
      :data-placeholder="placeholder"
      @input="onInput"
      @focus="focused = true"
      @blur="focused = false; sync()"
    ></div>
  </div>
</template>

<style scoped>
.text-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  overflow: hidden;
}
.text-editor:focus-within {
  border-color: var(--line-strong);
}
.text-editor__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: var(--space-1);
  border-bottom: 1px solid var(--divider);
  background: var(--surface-2);
}
.text-editor__btn {
  display: inline-grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  padding: 0 var(--space-1);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-2);
  font: 600 var(--fs-10)/1 var(--font-body);
  cursor: pointer;
}
.text-editor__btn:hover {
  background: var(--surface-3);
  color: var(--text);
}
.text-editor__body {
  min-height: 150px;
  padding: var(--space-3);
  outline: none;
  font: 400 var(--fs-14)/1.6 var(--font-body);
  color: var(--text);
}
.text-editor__body:empty::before {
  content: attr(data-placeholder);
  color: var(--text-3);
  pointer-events: none;
}
.text-editor__body :deep(h1) {
  font-size: var(--fs-24);
  margin: 0.5em 0;
}
.text-editor__body :deep(h2) {
  font-size: var(--fs-20);
  margin: 0.5em 0;
}
.text-editor__body :deep(blockquote) {
  margin: var(--space-2) 0;
  padding-left: var(--space-3);
  border-left: 3px solid var(--accent);
  color: var(--text-2);
}
.text-editor__body :deep(pre) {
  font-family: var(--font-mono);
  background: var(--canvas-bg);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  overflow-x: auto;
}
</style>
