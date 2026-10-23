<script setup lang="ts">
/** Catalogue demo: numeric stepper — default, bounded and disabled. */
import { ref } from "vue";
import { InputNumber } from "@vuedemonde";

const replicas = ref(3);
const port = ref(8080);
const workers = ref(16);
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <div>
        <div class="cat-label">Replicas</div>
        <InputNumber v-model="replicas" :min="1" :max="20" />
      </div>
      <div>
        <div class="cat-label">Port</div>
        <InputNumber v-model="port" :min="1024" :max="65535" />
      </div>
    </div>
    <div class="cat-row">
      <div>
        <div class="cat-label">At maximum</div>
        <InputNumber v-model="workers" :min="1" :max="16" />
      </div>
      <div>
        <div class="cat-label">Disabled</div>
        <InputNumber :model-value="8" :min="1" :max="16" disabled />
      </div>
    </div>
  </div>
</template>
