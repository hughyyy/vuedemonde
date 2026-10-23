<script setup lang="ts">
/** Catalogue demo: windowed flat list — 80 rows, one visible screen at ~200px. */
import { VirtualScroller } from "@vuedemonde";

const rows = Array.from(
  { length: 80 },
  (_, i) => `job #${String(i + 1).padStart(3, "0")} — ${i % 5 === 0 ? "flagged" : "plain"} · ${["build", "test", "deploy"][i % 3]}`,
);
</script>

<template>
  <div class="cat-demo">
    <!-- The scroller is flex:1; give it a definite height so its own height prop
         isn't overridden by the auto-height column flex context. -->
    <div style="height: 220px; width: 100%" class="cat-box">
      <VirtualScroller :items="rows" :height="220">
        <template #item="{ item }">
          <div
            style="
              display: flex;
              align-items: center;
              height: 100%;
              padding: 0 10px;
              border-bottom: 1px solid var(--line);
              font-family: var(--font-mono);
              font-size: var(--fs-12);
              color: var(--text-2);
            "
          >
            {{ item }}
          </div>
        </template>
      </VirtualScroller>
    </div>
  </div>
</template>
