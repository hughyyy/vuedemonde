<script setup lang="ts">
import { ref } from "vue";
import { AppButton, AppIcon } from "./index";

/** Inplace — inline display ↔ edit toggle (click to edit). */

const emit = defineEmits<{ save: []; cancel: [] }>();

const editing = ref(false);

function cancel(): void {
  editing.value = false;
  emit("cancel");
}
</script>

<template>
  <div class="inplace">
    <div v-if="!editing" class="inplace__display" role="button" tabindex="0" @click="editing = true" @keydown.enter.prevent="editing = true">
      <span class="inplace__value"><slot /></span>
      <AppIcon name="edit" :size="12" class="inplace__pencil" />
    </div>
    <div v-else class="inplace__editor">
      <slot name="editor" />
      <div class="inplace__actions">
        <AppButton variant="ghost" size="sm" @click="cancel">Cancel</AppButton>
        <AppButton size="sm" @click="emit('save'); editing = false">Done</AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inplace {
  min-width: 0;
}
.inplace__display {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  border: 1px dashed transparent;
  cursor: text;
}
.inplace__display:hover {
  border-color: var(--line);
  background: var(--surface-2);
}
.inplace__pencil {
  color: var(--text-3);
  opacity: 0;
  transition: opacity var(--dur-1) var(--ease-out);
}
.inplace__display:hover .inplace__pencil {
  opacity: 1;
}
.inplace__editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 240px;
}
.inplace__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
</style>
