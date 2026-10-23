<script setup lang="ts">
/** Catalogue demo: collapsed overflow (+N), full stack and the three sizes. */
import { AvatarStack } from "@vuedemonde";

const team = [
  { name: "Ada Lovelace" },
  { name: "Grace Hopper" },
  { name: "Alan Turing" },
  { name: "Barbara Liskov" },
  { name: "Frances Allen" },
  { name: "Katherine Johnson" },
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <AvatarStack :people="team" :max="3" size="sm" />
      <AvatarStack :people="team" :max="6" size="md" />
      <AvatarStack :people="team" size="lg" />
    </div>
    <div class="cat-row">
      <AvatarStack :people="team.slice(0, 2)" size="sm" />
      <AvatarStack :people="team.slice(0, 1)" size="md" />
    </div>
  </div>
</template>
