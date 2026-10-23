<script setup lang="ts">
/** Catalogue demo: empty states with and without a hint, icon or action. */
import { AppButton, AppEmptyState } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <AppEmptyState icon="inbox" title="No runs yet" hint="Trigger a build to see its history here." />
      <AppEmptyState icon="search" title="No results" hint="Try a shorter query.">
        <template #action>
          <AppButton size="sm" variant="secondary">Clear filters</AppButton>
        </template>
      </AppEmptyState>
      <AppEmptyState title="Nothing selected" />
    </div>
  </div>
</template>
