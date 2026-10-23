<script setup lang="ts">
/** Catalogue demo: page trail with the current node as the terminal crumb. */
import { ref } from "vue";
import { Breadcrumb, type BreadcrumbItem } from "@vuedemonde";

const picked = ref("");

const trail: BreadcrumbItem[] = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "nebula", label: "Nebula" },
  { id: "deploy", label: "Deploy pipeline" },
];
</script>

<template>
  <div class="cat-demo cat-fill">
    <Breadcrumb :items="trail" @select="(id: string) => (picked = id)" />
    <span class="cat-label">four levels · last one is the current page</span>
    <div class="cat-row">
      <Breadcrumb :items="trail.slice(0, 2)" />
      <span class="cat-label">{{ picked ? `selected: ${picked}` : "click a crumb" }}</span>
    </div>
  </div>
</template>
