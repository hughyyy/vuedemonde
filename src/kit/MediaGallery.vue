<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { AppIcon } from "./index";

export type GalleryImage = { src: string; alt: string };

/** Gallery — image grid with a lightbox viewer (prev/next/Esc). */

const props = withDefaults(
  defineProps<{
    images: GalleryImage[];
  }>(),
  {},
);

const viewer = ref(false);
const index = ref(0);

function open(i: number): void {
  index.value = i;
  viewer.value = true;
}

function go(d: number): void {
  index.value = (index.value + d + props.images.length) % Math.max(1, props.images.length);
}

function onKeydown(e: KeyboardEvent): void {
  if (!viewer.value) return;
  if (e.key === "Escape") viewer.value = false;
  else if (e.key === "ArrowRight") go(1);
  else if (e.key === "ArrowLeft") go(-1);
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
watch(viewer, (v) => { if (v) index.value = Math.min(index.value, Math.max(0, props.images.length - 1)); });
</script>

<template>
  <div class="media-gallery">
    <div class="media-gallery__grid">
      <button v-for="(img, i) in images" :key="i" class="media-gallery__thumb" type="button" :aria-label="`View ${img.alt}`" @click="open(i)">
        <img :src="img.src" :alt="img.alt" loading="lazy" />
      </button>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="viewer" class="media-gallery__viewer" @mousedown.self="viewer = false">
          <div class="media-gallery__stage">
            <img :src="images[index]?.src" :alt="images[index]?.alt" />
            <p class="media-gallery__caption">{{ images[index]?.alt }} — {{ index + 1 }} / {{ images.length }}</p>
          </div>
          <button class="media-gallery__nav is-prev" type="button" aria-label="Previous" @click.stop="go(-1)"><AppIcon name="chevron-left" :size="20" /></button>
          <button class="media-gallery__nav is-next" type="button" aria-label="Next" @click.stop="go(1)"><AppIcon name="chevron-right" :size="20" /></button>
          <button class="media-gallery__close" type="button" aria-label="Close" @click="viewer = false"><AppIcon name="close" :size="16" /></button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.media-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-2);
}
.media-gallery__thumb {
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: zoom-in;
  background: var(--surface-2);
  aspect-ratio: 4 / 3;
}
.media-gallery__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.media-gallery__thumb:hover {
  border-color: var(--accent);
}
.media-gallery__viewer {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: grid;
  place-items: center;
  background: rgba(4, 8, 12, 0.85);
}
.media-gallery__stage {
  max-width: 86vw;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.media-gallery__stage img {
  max-width: 86vw;
  max-height: 78vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-modal);
}
.media-gallery__caption {
  margin: 0;
  text-align: center;
  color: var(--text-2);
  font: 400 var(--fs-12)/1.5 var(--font-body);
}
.media-gallery__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: var(--surface-1);
  color: var(--text);
  cursor: pointer;
}
.media-gallery__nav.is-prev {
  left: var(--space-5);
}
.media-gallery__nav.is-next {
  right: var(--space-5);
}
.media-gallery__close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--surface-1);
  color: var(--text);
  cursor: pointer;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur-2) var(--ease-out);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
