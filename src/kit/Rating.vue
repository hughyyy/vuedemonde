<script setup lang="ts">
import { computed } from "vue";
import { AppIcon } from "./index";

/** Rating — star-based selection (0..max). */

const props = withDefaults(
  defineProps<{
    modelValue: number;
    max?: number;
    readonly?: boolean;
  }>(),
  { max: 5, readonly: false },
);

const emit = defineEmits<{ "update:modelValue": [v: number] }>();

const stars = computed(() => Array.from({ length: props.max }, (_, i) => i + 1));
</script>

<template>
  <div class="rating" role="slider" :aria-valuemin="0" :aria-valuemax="max" :aria-valuenow="modelValue" tabindex="0"
    @keydown.arrow-right.prevent="!readonly && emit('update:modelValue', Math.min(max, modelValue + 1))"
    @keydown.arrow-left.prevent="!readonly && emit('update:modelValue', Math.max(0, modelValue - 1))">
    <button
      v-for="s in stars"
      :key="s"
      class="rating__star"
      :class="{ 'is-on': s <= modelValue }"
      type="button"
      :disabled="readonly"
      :aria-label="`${s} star${s > 1 ? 's' : ''}`"
      @click="!readonly && emit('update:modelValue', s === modelValue ? 0 : s)"
    >
      <AppIcon name="star" :size="18" />
    </button>
  </div>
</template>

<style scoped>
.rating {
  display: inline-flex;
  gap: 2px;
}
.rating__star {
  display: inline-grid;
  place-items: center;
  padding: 2px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--surface-3);
  cursor: pointer;
}
.rating__star:hover {
  color: var(--warn);
}
.rating__star.is-on {
  color: var(--warn);
}
.rating__star:disabled {
  cursor: default;
}
</style>
