<script setup lang="ts">
/** FloatLabel — label overlays the input and floats up on focus/value.
 *  Usage: <FloatLabel><input placeholder=" "><label>Name</label></FloatLabel> */
</script>

<template>
  <div class="float-label">
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
