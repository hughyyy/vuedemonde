<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    /** Person's display name — used for initials + aria-label. */
    name: string;
    /** Optional image URL; renders the image (initials fallback on error/absent). */
    src?: string;
    size?: "sm" | "md" | "lg";
    tint?: "neutral" | "accent" | "ok" | "warn" | "err" | "info";
  }>(),
  { size: "md", tint: "neutral" },
);

/** True once the image fails to load — the prop contract promises an initials
 *  fallback, and without this a dead URL renders the browser's broken-image
 *  glyph plus alt text inside the circle. */
const failed = ref(false);
watch(
  () => props.src,
  () => {
    failed.value = false;
  },
);

const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join(""),
);
</script>

<template>
  <span class="app-avatar" :class="[`is-${props.size}`, `is-${props.tint}`]" role="img" :aria-label="props.name" :title="props.name">
    <img
      v-if="props.src && !failed"
      :src="props.src"
      :alt="props.name"
      class="app-avatar__img"
      @error="failed = true"
    />
    <span v-else class="app-avatar__initials">{{ initials }}</span>
  </span>
</template>

<style scoped>
.app-avatar {
  display: inline-grid;
  place-items: center;
  flex: none;
  border-radius: var(--radius-pill);
  overflow: hidden;
  user-select: none;
  font-family: var(--font-body);
  font-weight: var(--fw-600);
}
.app-avatar.is-sm {
  width: 20px;
  height: 20px;
  font-size: var(--fs-10);
}
.app-avatar.is-md {
  width: 28px;
  height: 28px;
  font-size: var(--fs-12);
}
.app-avatar.is-lg {
  width: 36px;
  height: 36px;
  font-size: var(--fs-13);
}
/* `min-width/min-height: 0` + absolute-free sizing: an <img> inside an
 * inline-grid otherwise contributes its intrinsic size to the track, so the
 * picture overflowed the circle (measured 52x34 in a 28px avatar). */
.app-avatar__img {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  object-fit: cover;
  display: block;
}
.app-avatar__initials {
  line-height: 1;
  /* keep two initials inside small circles without horizontal clipping */
  letter-spacing: -0.02em;
  white-space: nowrap;
}
.app-avatar.is-neutral {
  background: var(--surface-3);
  color: var(--text-2);
}
.app-avatar.is-accent {
  background: var(--accent-gradient);
  color: var(--accent-ink);
}
.app-avatar.is-ok {
  background: var(--ok);
  color: #fff;
}
.app-avatar.is-warn {
  background: var(--warn);
  color: #fff;
}
.app-avatar.is-err {
  background: var(--err);
  color: #fff;
}
.app-avatar.is-info {
  background: var(--info);
  color: #fff;
}
</style>
