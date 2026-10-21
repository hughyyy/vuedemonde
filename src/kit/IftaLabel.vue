<script setup lang="ts">
import { onMounted, ref, useId } from "vue";
/** IftaLabel — the label acts as the input's placeholder and shifts to a
 *  floating caption on focus/value.
 *  Usage: <IftaLabel><input placeholder=" "><label>Name</label></IftaLabel>
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
  <div ref="root" class="ifta-label">
    <slot />
    <label><slot name="label" /></label>
  </div>
</template>

<style scoped>
.ifta-label {
  position: relative;
}
.ifta-label :deep(input),
.ifta-label :deep(textarea) {
  width: 100%;
  padding-top: var(--space-4);
  padding-bottom: var(--space-1);
}
.ifta-label label {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-3);
  font: 400 var(--fs-13)/1.4 var(--font-body);
  pointer-events: none;
  transition: var(--dur-2) var(--ease-out);
  white-space: nowrap;
}
.ifta-label :deep(input:not(:placeholder-shown)) ~ label,
.ifta-label :deep(input:focus) ~ label {
  color: var(--accent);
}
</style>
