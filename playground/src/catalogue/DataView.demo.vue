<script setup lang="ts">
/** Catalogue demo: the same items in list and in grid layout. */
import { DataView } from "@vuedemonde";

const services = [
  "Deploy pipeline",
  "Search index",
  "Token service",
  "Billing report",
  "Audit trail",
  "Feature flags",
];
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <span class="cat-label">list</span>
      <DataView :items="services" layout="list">
        <template #item="{ item }">
          <div
            style="
              padding: 8px 10px;
              border: 1px solid var(--line);
              border-radius: var(--radius-sm);
              font-size: var(--fs-13);
            "
          >
            {{ item }}
          </div>
        </template>
      </DataView>
    </div>
    <div class="cat-col">
      <span class="cat-label">grid</span>
      <DataView :items="services.slice(0, 4)" layout="grid" grid-cols="repeat(2, minmax(0, 1fr))">
        <template #item="{ item }">
          <div
            style="
              padding: 10px;
              border: 1px solid var(--line);
              border-radius: var(--radius-md);
              background: var(--surface-1);
              font-size: var(--fs-13);
            "
          >
            {{ item }}
          </div>
        </template>
      </DataView>
    </div>
  </div>
</template>
