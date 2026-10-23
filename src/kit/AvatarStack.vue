<script setup lang="ts">
import { computed } from "vue";
import AppAvatar from "./AppAvatar.vue";

export type AvatarPerson = { name: string; src?: string };

const props = withDefaults(
  defineProps<{
    people: AvatarPerson[];
    size?: "sm" | "md" | "lg";
    /** how many avatars to show before collapsing into +N */
    max?: number;
  }>(),
  { size: "sm", max: 4 },
);

const shown = computed(() => props.people.slice(0, props.max));
const overflow = computed(() => Math.max(0, props.people.length - props.max));
</script>

<template>
  <span class="avatar-stack" :title="people.map((p) => p.name).join(', ')">
    <AppAvatar
      v-for="p in shown"
      :key="p.name"
      :name="p.name"
      :src="p.src"
      :size="size"
      class="avatar-stack__av"
    />
    <span v-if="overflow" class="avatar-stack__more" :class="`is-${size}`">+{{ overflow }}</span>
  </span>
</template>

<style scoped>
.avatar-stack {
  display: inline-flex;
  align-items: center;
  line-height: 0;
}
/* Overlap scales with circle size: a fixed -7px on a 20px sm circle eats 35% of
 * the avatar and clips the right-hand initial (the initials sit centred, so the
 * neighbouring circle covers them). md/lg have room; sm overlaps less. */
.avatar-stack__av {
  margin-left: -4px;
  border: 2px solid var(--surface-1);
}
.avatar-stack__av:first-child {
  margin-left: 0;
}
.avatar-stack__av.is-md,
.avatar-stack__av.is-lg {
  margin-left: -7px;
}
.avatar-stack__more {
  display: inline-grid;
  place-items: center;
  border: 2px solid var(--surface-1);
  margin-left: -7px;
  border-radius: var(--radius-pill);
  background: var(--surface-3);
  color: var(--text-2);
  font-weight: var(--fw-600);
}
.avatar-stack__more.is-sm {
  width: 20px;
  height: 20px;
  font-size: var(--fs-10);
  margin-left: -4px;
}
.avatar-stack__more.is-md {
  width: 28px;
  height: 28px;
  font-size: var(--fs-11);
}
.avatar-stack__more.is-lg {
  width: 36px;
  height: 36px;
  font-size: var(--fs-12);
}
</style>
