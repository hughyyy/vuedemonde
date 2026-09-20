<script setup lang="ts">
import { ref } from "vue";

/** InputOtp — segmented one-time-password input with auto-advance + paste. */

const props = withDefaults(
  defineProps<{
    modelValue: string;
    length?: number;
    disabled?: boolean;
  }>(),
  { length: 6, disabled: false },
);

const emit = defineEmits<{ "update:modelValue": [v: string] }>();

const refs = ref<(HTMLInputElement | null)[]>([]);
const local = ref<string[]>(Array.from({ length: props.length }, () => ""));

function sync(): void {
  emit("update:modelValue", local.value.join(""));
}

function onInput(i: number, e: Event): void {
  const raw = (e.target as HTMLInputElement).value;
  // keep last char
  local.value[i] = raw.slice(-1);
  (e.target as HTMLInputElement).value = local.value[i]!;
  if (local.value[i]) {
    const next = i + 1;
    if (next < props.length) refs.value[next]?.focus();
  }
  sync();
}

function onKeydown(i: number, e: KeyboardEvent): void {
  if (e.key === "Backspace" && !local.value[i] && i > 0) {
    refs.value[i - 1]?.focus();
  }
}

function onPaste(e: ClipboardEvent): void {
  e.preventDefault();
  const text = (e.clipboardData?.getData("text") ?? "").replace(/\s/g, "");
  const chars = text.slice(0, props.length).split("");
  for (let i = 0; i < props.length; i++) local.value[i] = chars[i] ?? "";
  refs.value[Math.min(chars.length, props.length - 1)]?.focus();
  sync();
}
</script>

<template>
  <div class="input-otp">
    <input
      v-for="(_, i) in length"
      :key="i"
      :ref="(el: unknown) => (refs[i] = el as HTMLInputElement | null)"
      class="input-otp__box"
      :value="local[i]"
      type="text"
      inputmode="numeric"
      :maxlength="2"
      :disabled="disabled"
      aria-label="OTP digit"
      @input="onInput(i, $event)"
      @keydown="onKeydown(i, $event)"
      @paste="onPaste"
    />
  </div>
</template>

<style scoped>
.input-otp {
  display: inline-flex;
  gap: var(--space-2);
}
.input-otp__box {
  width: 42px;
  height: 46px;
  text-align: center;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text);
  font: 600 var(--fs-16)/1 var(--font-body);
  transition: border-color var(--dur-1) var(--ease-out);
}
.input-otp__box:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.input-otp__box:disabled {
  opacity: 0.5;
}
</style>
