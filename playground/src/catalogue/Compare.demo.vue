<script setup lang="ts">
/** Catalogue demo: the before/after divider at three positions. */
import { ref } from "vue";
import { Compare } from "@vuedemonde";

const mid = ref(0.5);
const early = ref(0.2);
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-fill">
      <span class="cat-label">divider at 50%</span>
      <Compare v-model="mid" style="height: 140px">
        <template #a>
          <div
            style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: var(--fs-13); background: var(--surface-2); color: var(--text-2)"
          >
            v0.1 — dense rows
          </div>
        </template>
        <template #b>
          <div
            style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: var(--fs-13); background: var(--accent-soft); color: var(--accent)"
          >
            v0.2 — compact rows
          </div>
        </template>
      </Compare>
    </div>
    <div class="cat-fill">
      <span class="cat-label">divider at 20%</span>
      <Compare v-model="early" style="height: 90px">
        <template #a>
          <div style="display: grid; place-items: center; height: 100%; font-size: var(--fs-13); background: var(--surface-2); color: var(--text-2)">
            before
          </div>
        </template>
        <template #b>
          <div style="display: grid; place-items: center; height: 100%; font-size: var(--fs-13); background: var(--accent-soft); color: var(--accent)">
            after
          </div>
        </template>
      </Compare>
    </div>
  </div>
</template>
