<script setup lang="ts">
/** Catalogue demo: reorderable rows, plus the two-item minimum shape. */
import { ref } from "vue";
import { OrderList } from "@vuedemonde";

const stages = ref(["Discovery", "Design", "Build", "Validate", "Ship"]);
const short = ref(["Backlog", "In progress"]);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-col">
      <span class="cat-label">pipeline order</span>
      <OrderList v-model="stages">
        <template #item="{ item, index }">
          <span style="display: inline-flex; gap: 8px; align-items: baseline">
            <span style="font-family: var(--font-mono); font-size: var(--fs-12); color: var(--text-3)">{{ index + 1 }}</span>
            {{ item }}
          </span>
        </template>
      </OrderList>
    </div>
    <div class="cat-col">
      <span class="cat-label">no reorder affordance needed</span>
      <OrderList v-model="short" :selectable="false" />
    </div>
  </div>
</template>
