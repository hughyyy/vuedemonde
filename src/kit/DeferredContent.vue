<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

/** DeferredContent — postpones rendering its slot until scrolled into view. */

const loaded = ref(false);
const target = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;

onMounted(() => {
  io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        loaded.value = true;
        io?.disconnect();
      }
    },
    { rootMargin: "200px" },
  );
  if (target.value) io.observe(target.value);
});
onBeforeUnmount(() => io?.disconnect());
</script>

<template>
  <div ref="target" class="deferred">
    <slot v-if="loaded" />
    <slot v-else name="placeholder" />
  </div>
</template>

<style scoped>
.deferred {
  min-height: 0;
}
</style>
