<script setup lang="ts">
/** IftaLabel — the label acts as the input's placeholder and shifts to a
 *  floating caption on focus/value.
 *  Usage: <IftaLabel><input placeholder=" "><label>Name</label></IftaLabel> */
</script>

<template>
  <div class="ifta-label">
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
