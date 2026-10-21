<script setup lang="ts">
import { AppPanel, AppBadge } from "@vuedemond";

defineProps<{
  title: string;
  desc?: string;
  /** badge chips shown next to the title (e.g. "v-model", "slots"). */
  chips?: string[];
}>();
</script>

<template>
  <AppPanel class="demo" :title="title" elevation="raised">
    <template #actions>
      <div class="demo-chips">
        <AppBadge v-for="c in chips" :key="c" tint="info">{{ c }}</AppBadge>
      </div>
    </template>
    <p v-if="desc" class="demo-desc">{{ desc }}</p>
    <div class="demo-body">
      <slot />
    </div>
  </AppPanel>
</template>

<style scoped>
/* Grid cell in the family sections: no vertical margins — the section grid
 * owns the gaps, so catalogue renders carry no dead vertical space. */
.demo {
  margin: 0;
  padding: 14px;
}
.demo-chips {
  display: flex;
  gap: 4px;
}
.demo-desc {
  margin: 0 0 10px;
  font-size: var(--fs-12);
  color: var(--text-3);
}
.demo-body {
  padding: 2px;
}
</style>
