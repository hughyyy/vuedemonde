<script setup lang="ts">
import { computed } from "vue";
import { AppIcon } from "./index";
import type { StepperItem } from "./types";

/** Stepper — wizard-style progress steps with per-step panels. */

const props = withDefaults(
  defineProps<{
    steps: StepperItem[];
    modelValue: string;
    linear?: boolean;
  }>(),
  { linear: true },
);

const emit = defineEmits<{ "update:modelValue": [id: string]; next: []; prev: [] }>();

const activeIdx = computed(() => Math.max(0, props.steps.findIndex((s) => s.id === props.modelValue)));

function onStep(it: StepperItem, i: number): void {
  const allowed = !props.linear || i <= activeIdx.value;
  if (allowed) emit("update:modelValue", it.id);
}
</script>

<template>
  <div class="stepper">
    <ol class="stepper__head">
      <li v-for="(it, i) in steps" :key="it.id" class="stepper__step" :class="{ 'is-active': modelValue === it.id, 'is-done': i < activeIdx, 'is-locked': linear && i > activeIdx }">
        <button class="stepper__node" type="button" :aria-current="modelValue === it.id ? 'step' : undefined" @click="onStep(it, i)">
          <AppIcon v-if="i < activeIdx" name="check" :size="13" />
          <template v-else>{{ i + 1 }}</template>
        </button>
        <span class="stepper__label">{{ it.label }}</span>
        <span v-if="i < steps.length - 1" class="stepper__connector" :class="{ 'is-filled': i < activeIdx }" />
      </li>
    </ol>
    <div class="stepper__body">
      <slot :name="`step-${modelValue}`" />
      <div v-if="$slots.actions" class="stepper__actions"><slot name="actions" /></div>
    </div>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.stepper__head {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 0;
  width: 100%;
  overflow: hidden;
}
.stepper__step {
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}
.stepper__node {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: var(--surface-1);
  color: var(--text-2);
  font: 600 var(--fs-13)/1 var(--font-body);
  cursor: pointer;
}
.stepper__node:hover:not(.is-locked) {
  border-color: var(--accent);
  color: var(--accent);
}
.stepper__step.is-active .stepper__node {
  background: var(--accent-gradient);
  border-color: transparent;
  color: var(--accent-ink);
}
.stepper__step.is-done .stepper__node {
  background: var(--ok-soft);
  border-color: transparent;
  color: var(--ok);
}
.stepper__step.is-locked .stepper__node {
  opacity: 0.5;
  cursor: not-allowed;
}
.stepper__label {
  font: 500 var(--fs-11)/1.4 var(--font-body);
  color: var(--text-3);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stepper__step.is-active .stepper__label {
  color: var(--text);
}
/* connector runs from this step's node centre to the next step's node centre.
   Flex:1 keeps all steps equal, so width:100% + left:50% lands exactly there. */
.stepper__connector {
  position: absolute;
  top: 14px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--surface-3);
  z-index: 0;
}
.stepper__connector.is-filled {
  background: var(--ok);
}
.stepper__body {
  min-height: 80px;
}
.stepper__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
</style>
