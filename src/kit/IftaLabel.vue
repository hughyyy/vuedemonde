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
/* The label must move up for a value/focus, even when the control is a
 * composite <AppInput> whose input is nested rather than a sibling. `:has()`
 * covers both bare controls and composites (sibling selectors only matched the
 * bare form, leaving the caption over the value for AppInput wraps). */
.ifta-label:has(:deep(input:not(:placeholder-shown))) label,
.ifta-label:has(:deep(input:focus)) label,
.ifta-label:has(:deep(textarea:not(:placeholder-shown))) label,
.ifta-label:has(:deep(textarea:focus)) label {
  top: var(--space-1);
  transform: none;
  font-size: var(--fs-10);
  color: var(--accent);
}
</style>
