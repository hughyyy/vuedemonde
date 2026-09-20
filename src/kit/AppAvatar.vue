<script setup lang="ts">
import { computed } from "vue";

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
    <img v-if="props.src" :src="props.src" :alt="props.name" class="app-avatar__img" />
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
.app-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
