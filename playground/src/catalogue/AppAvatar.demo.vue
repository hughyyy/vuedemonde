<script setup lang="ts">
/** Catalogue demo: every size and tint, plus initials and image fallback. */
import { AppAvatar } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <AppAvatar name="Ada Lovelace" size="sm" tint="neutral" />
      <AppAvatar name="Katherine Johnson" size="md" tint="ok" />
      <AppAvatar name="Grace Hopper" size="md" tint="info" />
      <AppAvatar name="Alan Turing" size="lg" tint="warn" />
      <AppAvatar name="Barbara Liskov" size="lg" tint="accent" />
      <AppAvatar name="Frances Allen" size="lg" tint="err" />
    </div>
    <div class="cat-row">
      <AppAvatar name="Ada Lovelace" src="https://picsum.photos/seed/vuedemonde-avatar/64/64" size="md" />
      <AppAvatar name="Grace Hopper" size="sm" />
      <AppAvatar name="Alan Turing" size="sm" tint="accent" />
    </div>
  </div>
</template>
