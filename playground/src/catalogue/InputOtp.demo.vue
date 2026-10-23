<script setup lang="ts">
/** Catalogue demo: a six-digit code, a four-cell code and the disabled state. */
import { onMounted, ref } from "vue";
import { InputOtp } from "@vuedemonde";

const code = ref("");
const short = ref("");
const locked = ref("");
const six = ref<HTMLElement | null>(null);
const four = ref<HTMLElement | null>(null);

/* The cell contents are component-local state (the prop only carries the joined
 * string), so seed them through real input events, as a typist would. */
function type(host: HTMLElement | null, digits: string): void {
  const cells = host?.querySelectorAll<HTMLInputElement>("input");
  if (!cells) return;
  digits.split("").forEach((d, i) => {
    const cell = cells[i];
    if (!cell) return;
    cell.value = d;
    cell.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

onMounted(() => {
  type(six.value, "482917");
  type(four.value, "2048");
});
</script>

<template>
  <div class="cat-demo">
    <div class="cat-row">
      <div ref="six"><InputOtp v-model="code" :length="6" /></div>
      <span class="cat-label">{{ code.length }}/6 entered</span>
    </div>
    <div class="cat-row">
      <div ref="four"><InputOtp v-model="short" :length="4" /></div>
      <span class="cat-label">4 cells</span>
    </div>
    <div class="cat-row">
      <InputOtp v-model="locked" :length="6" disabled />
      <span class="cat-label">disabled</span>
    </div>
  </div>
</template>
