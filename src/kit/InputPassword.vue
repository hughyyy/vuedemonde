<script setup lang="ts">
import { computed, ref } from "vue";
import { AppIcon } from "./index";

/** InputPassword — masked field with show/hide toggle + strength meter. */

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    disabled?: boolean;
    showToggle?: boolean;
    strength?: boolean;
    /** accessible name for the field. */
    ariaLabel?: string;
  }>(),
  { placeholder: "", disabled: false, showToggle: true, strength: false, ariaLabel: "Password" },
);

const emit = defineEmits<{ "update:modelValue": [v: string] }>();

const reveal = ref(false);

const strength = computed(() => {
  if (!props.strength) return 0;
  const v = props.modelValue;
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
  return s; // 0..4
});

const meterTint = ["err", "err", "warn", "ok", "ok"] as const;

function onInput(e: Event): void {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="input-password">
    <div class="input-password__field">
      <input
        class="input-password__input"
        :type="reveal ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="ariaLabel"
        autocomplete="off"
        @input="onInput"
      />
      <button
        v-if="showToggle"
        class="input-password__toggle"
        type="button"
        :aria-label="reveal ? 'Hide password' : 'Show password'"
        :aria-pressed="reveal"
        @click="reveal = !reveal"
      >
        <AppIcon name="eye" :size="15" class="input-password__eye" :class="{ 'is-off': !reveal }" />
      </button>
    </div>
    <div v-if="strength" class="input-password__meter" aria-hidden="true">
      <span
        v-for="i in 4"
        :key="i"
        class="input-password__bar"
        :class="[`is-${meterTint[Math.max(0, strength - 1)]}`, { 'is-filled': i <= strength }]"
      />
    </div>
  </div>
</template>

<style scoped>
.input-password {
  display: inline-flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 200px;
}
.input-password__field {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.input-password__input {
  width: 100%;
  padding: var(--space-2) var(--space-7) var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text);
  font: 400 var(--fs-14)/1.4 var(--font-body);
}
.input-password__input:focus {
  outline: none;
  border-color: var(--line-strong);
}
.input-password__toggle {
  position: absolute;
  right: var(--space-2);
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
}
.input-password__toggle:hover {
  color: var(--text);
}
.input-password__eye.is-off {
  opacity: 0.5;
}
.input-password__meter {
  display: flex;
  gap: var(--space-1);
}
.input-password__bar {
  flex: 1;
  height: 3px;
  border-radius: var(--radius-pill);
  background: var(--surface-3);
}
.input-password__bar.is-filled.is-err {
  background: var(--err);
}
.input-password__bar.is-filled.is-warn {
  background: var(--warn);
}
.input-password__bar.is-filled.is-ok {
  background: var(--ok);
}
</style>
