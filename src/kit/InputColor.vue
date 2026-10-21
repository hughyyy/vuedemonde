<script setup lang="ts">
import { ref } from "vue";
import { AppIcon } from "./index";

/** InputColor — preset swatches + a native picker for custom colours (U12 accent). */

const props = withDefaults(
  defineProps<{
    modelValue: string;
    swatches?: string[];
  }>(),
  {
    swatches: () => ["#4f9cf9", "#9b59f9", "#e09a4e", "#3ecf6e", "#f25d5d", "#d9b35a", "#0a7fbf", "#1b2330"],
  },
);

const emit = defineEmits<{ "update:modelValue": [v: string] }>();

const native = ref<HTMLInputElement | null>(null);

function picker(): void {
  native.value?.click();
}
</script>

<template>
  <div class="input-color">
    <button class="input-color__current" type="button" :style="{ background: modelValue }" :aria-label="`Current colour: ${modelValue}`" @click="picker">
      <AppIcon name="edit" :size="12" class="input-color__edit" />
    </button>
    <div class="input-color__swatches">
      <button
        v-for="s in swatches"
        :key="s"
        class="input-color__swatch"
        :class="{ 'is-active': s.toLowerCase() === modelValue.toLowerCase() }"
        type="button"
        :style="{ background: s }"
        :aria-label="s"
        @click="emit('update:modelValue', s)"
      />
    </div>
    <input
      ref="native"
      class="input-color__native"
      type="color"
      :value="modelValue"
      tabindex="-1"
      aria-hidden="true"
      @input="emit('update:modelValue', (native?.value ?? modelValue))"
    />
  </div>
</template>

<style scoped>
.input-color {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.input-color__current {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  cursor: pointer;
}
.input-color__edit {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
.input-color__swatches {
  display: inline-flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}
.input-color__swatch {
  width: 22px;
  height: 22px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0;
}
.input-color__swatch.is-active {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
.input-color__native {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
