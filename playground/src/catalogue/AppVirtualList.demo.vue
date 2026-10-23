<script setup lang="ts">
/** Catalogue demo: dynamic-height virtualised rows (long and short entries mixed). */
import { AppVirtualList } from "@vuedemonde";

type Turn = { title: string; body: string };

const turns: Turn[] = Array.from({ length: 12 }, (_, i) => ({
  title: `Turn ${i + 1} — ${["Plan the migration", "Review the diff", "Run the suite", "Cut the release"][i % 4]}`,
  body:
    i % 3 === 0
      ? "A longer transcript entry with a couple of sentences, so the measured row height differs from its neighbours."
      : "Short line.",
}));
</script>

<template>
  <div class="cat-demo">
    <div class="cat-fill cat-box" style="height: 220px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface-1)">
      <AppVirtualList :items="turns" style="height: 100%">
        <template #item="{ item }">
          <div style="padding: 8px 12px; border-bottom: 1px solid var(--line)">
            <p style="margin: 0 0 2px; font-size: var(--fs-13); font-weight: var(--fw-600)">{{ (item as Turn).title }}</p>
            <p style="margin: 0; font-size: var(--fs-12); color: var(--text-3)">{{ (item as Turn).body }}</p>
          </div>
        </template>
      </AppVirtualList>
    </div>
    <span class="cat-label">12 measured turns — window only renders what fits</span>
  </div>
</template>
