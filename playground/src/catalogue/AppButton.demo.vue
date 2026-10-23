<script setup lang="ts">
/** Catalogue demo: every button variant, size, icon and state. */
import { AppButton } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <AppButton>Primary</AppButton>
      <AppButton variant="secondary">Secondary</AppButton>
      <AppButton variant="ghost">Ghost</AppButton>
      <AppButton variant="danger">Danger</AppButton>
    </div>
    <div class="cat-row">
      <AppButton size="sm">Small</AppButton>
      <AppButton size="md" icon="star">Medium</AppButton>
      <AppButton icon="settings" aria-label="Settings" />
      <AppButton icon="spinner" loading>Saving</AppButton>
    </div>
    <div class="cat-row">
      <AppButton disabled>Disabled</AppButton>
      <AppButton variant="secondary" disabled>Disabled secondary</AppButton>
    </div>
  </div>
</template>
