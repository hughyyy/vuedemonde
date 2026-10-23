<script setup lang="ts">
/** Catalogue demo: card with header actions and a footer, plus a plain one. */
import { AppButton, Card } from "@vuedemonde";
</script>

<template>
  <div class="cat-demo cat-fill">
    <Card title="Release 0.2.1" subtitle="published 2 hours ago">
      <template #actions>
        <AppButton size="sm" variant="ghost" icon="copy">Duplicate</AppButton>
      </template>
      <span class="cat-label">18 components changed, 3 breaking. Rollout at 40% of workspaces.</span>
      <template #footer>
        <AppButton size="sm" variant="secondary">Rollback</AppButton>
        <AppButton size="sm">Promote</AppButton>
      </template>
    </Card>
    <Card title="Notes" subtitle="no footer, custom padding">
      <span class="cat-label">Card without an action slot — just a title, subtitle and body.</span>
    </Card>
  </div>
</template>
