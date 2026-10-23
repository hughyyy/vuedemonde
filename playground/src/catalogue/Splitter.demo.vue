<script setup lang="ts">
/** Catalogue demo: controlled split panes at 35%, plus a stacked variant. */
import { ref } from "vue";
import { Splitter } from "@vuedemonde";

const ratio = ref(0.35);
const stacked = ref(0.5);
</script>

<template>
  <div class="cat-demo cat-fill">
    <div class="cat-fill" style="height: 130px">
      <Splitter v-model="ratio">
        <template #a>
          <div class="cat-col" style="padding: 10px">
            <span class="cat-label">Files</span>
            <span class="cat-label">pipeline.yaml</span>
          </div>
        </template>
        <template #b>
          <div class="cat-col" style="padding: 10px">
            <span class="cat-label">Editor — {{ Math.round(ratio * 100) }}% / {{ Math.round((1 - ratio) * 100) }}%</span>
            <span class="cat-label">stages: build → test → deploy</span>
          </div>
        </template>
      </Splitter>
    </div>
    <div class="cat-fill" style="height: 120px">
      <Splitter v-model="stacked" orientation="vertical">
        <template #a>
          <div style="padding: 8px 10px"><span class="cat-label">Console</span></div>
        </template>
        <template #b>
          <div style="padding: 8px 10px"><span class="cat-label">Terminal — drag or use arrow keys</span></div>
        </template>
      </Splitter>
    </div>
  </div>
</template>
