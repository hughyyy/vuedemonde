<script setup lang="ts">
/** Catalogue demo: three-level hierarchy with tinted leaders and a selection. */
import { ref } from "vue";
import { OrgChart, type OrgNode } from "@vuedemonde";

const data: OrgNode = {
  id: "ceo",
  label: "Ada Lovelace",
  role: "Chief executive",
  tint: "accent",
  children: [
    {
      id: "product",
      label: "Grace Hopper",
      role: "VP Product",
      children: [
        { id: "design", label: "Barbara Liskov", role: "Design lead", tint: "info" },
        { id: "research", label: "Edsger Dijkstra", role: "Research" },
      ],
    },
    {
      id: "eng",
      label: "Alan Turing",
      role: "VP Engineering",
      icon: "node",
      children: [
        { id: "platform", label: "Katherine Johnson", role: "Platform", tint: "ok" },
        { id: "infra", label: "Dennis Ritchie", role: "Infrastructure", tint: "warn" },
      ],
    },
  ],
};

const selected = ref("eng");
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill">
      <OrgChart :data="data" selectable :selected-id="selected" @select="selected = $event" />
    </div>
  </div>
</template>
