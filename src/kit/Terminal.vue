<script setup lang="ts">
import { nextTick, ref } from "vue";

/** Terminal — read-only-ish command log with a runnable prompt line. */

const props = withDefaults(
  defineProps<{
    lines?: string[];
    prompt?: string;
    height?: string;
  }>(),
  { lines: () => [], prompt: "$", height: "220px" },
);

const emit = defineEmits<{ command: [cmd: string] }>();

const out = ref<string[]>([...props.lines]);
const cmd = ref("");
const bodyEl = ref<HTMLElement | null>(null);

function run(): void {
  const c = cmd.value.trim();
  if (c) {
    out.value.push(`${props.prompt} ${c}`);
    emit("command", c);
    cmd.value = "";
    void nextTick(() => {
      if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight;
    });
  }
}
</script>

<template>
  <div class="terminal" :style="{ height }">
    <div ref="bodyEl" class="terminal__body">
      <p v-for="(l, i) in out" :key="i" class="terminal__line">{{ l }}</p>
      <span class="terminal__cursor" aria-hidden="true" />
    </div>
    <div class="terminal__input-row">
      <span class="terminal__prompt">{{ prompt }}</span>
      <input
        v-model="cmd"
        class="terminal__input"
        type="text"
        spellcheck="false"
        autocomplete="off"
        aria-label="Terminal input"
        @keydown.enter.prevent="run"
      />
    </div>
  </div>
</template>

<style scoped>
.terminal {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--canvas-bg);
  overflow: hidden;
  font-family: var(--font-mono);
}
.terminal__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-3);
  color: var(--text);
  font-size: var(--fs-12);
  line-height: 1.6;
}
.terminal__line {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.terminal__cursor {
  display: inline-block;
  width: 7px;
  height: 14px;
  margin-left: 2px;
  vertical-align: text-bottom;
  background: var(--accent);
  animation: term-blink 1s steps(1) infinite;
}
@keyframes term-blink {
  50% {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .terminal__cursor {
    animation: none;
    opacity: 0.6;
  }
}
.terminal__input-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--line);
}
.terminal__prompt {
  color: var(--ok);
  font-size: var(--fs-12);
  flex: none;
}
.terminal__input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text);
  font: 400 var(--fs-12)/1.6 var(--font-mono);
}
.terminal__input:focus {
  outline: none;
}
</style>
