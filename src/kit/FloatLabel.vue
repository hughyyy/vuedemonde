<script setup lang="ts">
import { onMounted, ref, useId } from "vue";
/** FloatLabel — label overlays the input and floats up on focus/value.
 *  Usage: <FloatLabel><input placeholder=" "><label>Name</label></FloatLabel>
 *  The slotted input gets the label wired to it (for/id) on mount. */
const root = ref<HTMLElement | null>(null);
const uid = useId();
onMounted(() => {
  const input = root.value?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
  const label = root.value?.querySelector("label");
  if (input && label && !input.id) {
    input.id = uid;
    label.setAttribute("for", uid);
  }
});
</script>

<template>
  <div ref="root" class="float-label">
    <slot />
    <label><slot name="label" /></label>
  </div>
</template>

<style scoped>
.float-label {
  position: relative;
}
.float-label :deep(input),
.float-label :deep(textarea) {
  width: 100%;
}
.float-label :deep(input),
.float-label :deep(textarea) {
  padding-top: var(--space-4);
  padding-bottom: var(--space-1);
}
.float-label label {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-3);
  font: 400 var(--fs-13)/1.4 var(--font-body);
  pointer-events: none;
  transition: var(--dur-2) var(--ease-out);
}
.float-label :deep(input:not(:placeholder-shown)) ~ label,
.float-label :deep(input:focus) ~ label,
.float-label :deep(textarea:not(:placeholder-shown)) ~ label,
.float-label :deep(textarea:focus) ~ label {
  top: var(--space-1);
  transform: none;
  font-size: var(--fs-10);
  color: var(--accent);
}
</style>
