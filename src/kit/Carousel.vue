<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { AppIcon } from "./index";

/** Carousel — slide strip with prev/next + dots + optional autoplay. */

const props = withDefaults(
  defineProps<{
    items: unknown[];
    autoPlayMs?: number;
  }>(),
  { autoPlayMs: 0 },
);

const index = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function go(d: number): void {
  index.value = (index.value + d + props.items.length) % Math.max(1, props.items.length);
}

function dot(i: number): void {
  index.value = i;
}

onMounted(() => {
  if (props.autoPlayMs > 0 && props.items.length > 1) {
    timer = setInterval(() => go(1), props.autoPlayMs);
  }
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="carousel" role="region" aria-roledescription="carousel" aria-label="Carousel">
    <div class="carousel__viewport">
      <div class="carousel__track" :style="{ transform: `translateX(-${index * 100}%)` }">
        <div v-for="(item, i) in items" :key="i" class="carousel__slide">
          <slot name="item" :item="item" :index="i" />
        </div>
      </div>
    </div>
    <div class="carousel__controls">
      <button class="carousel__btn" type="button" aria-label="Previous" @click="go(-1)"><AppIcon name="chevron-left" :size="14" /></button>
      <div class="carousel__dots">
        <button v-for="(_, i) in items" :key="i" class="carousel__dot" :class="{ 'is-active': i === index }" type="button" :aria-label="`Slide ${i + 1}`" @click="dot(i)" />
      </div>
      <button class="carousel__btn" type="button" aria-label="Next" @click="go(1)"><AppIcon name="chevron-right" :size="14" /></button>
    </div>
  </div>
</template>

<style scoped>
.carousel {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}
.carousel__viewport {
  overflow: hidden;
  border-radius: var(--radius-md);
}
.carousel__track {
  display: flex;
  transition: transform var(--dur-3) var(--ease-out);
}
.carousel__slide {
  flex: 0 0 100%;
  min-width: 0;
}
.carousel__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}
.carousel__btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text-2);
  cursor: pointer;
}
.carousel__btn:hover {
  background: var(--surface-2);
  color: var(--text);
}
.carousel__dots {
  display: flex;
  gap: var(--space-1);
}
.carousel__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--surface-3);
  cursor: pointer;
}
.carousel__dot.is-active {
  background: var(--accent);
}
@media (prefers-reduced-motion: reduce) {
  .carousel__track {
    transition: none;
  }
}
</style>
