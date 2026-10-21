<script setup lang="ts">
import { ref, watch } from "vue";
import { AppButton, AppSelect, AppToggle, notify, THEME_IDS, THEME_LABELS, type ThemeId, type AccentChoice, applyAccent } from "@vuedemonde";

const theme = ref<ThemeId>("dark");

watch(theme, (t) => {
  document.documentElement.dataset.theme = t;
  localStorage.setItem("vuedemonde-theme", t);
});

const accentOn = ref(true);
const SOLIDS = ["#4f9cf9", "#3ecf6e", "#f0a33c", "#f25d5d", "#e0b64f", "#4fc3f7", "#a06cf9", "#ff5cd1", "#00ff66", "#ffd700"] as const;
const solid = ref("#4f9cf9");
const from = ref("#4f9cf9");
const to = ref("#a06cf9");
const gradient = ref(false);

watch(
  [accentOn, solid, from, to, gradient],
  () => {
    if (!accentOn.value) {
      applyAccent(null);
      return;
    }
    const choice: AccentChoice = gradient.value
      ? { kind: "gradient", from: from.value, to: to.value }
      : { kind: "solid", color: solid.value };
    applyAccent(choice);
  },
  { immediate: true },
);

const themeOptions = THEME_IDS.map((id) => ({ value: id, label: THEME_LABELS[id] }));
</script>

<template>
  <header class="tbar">
    <div class="tbar-left">
      <AppIcon name="theme" :size="18" class="tbar-logo" />
      <span class="tbar-title">Component catalog</span>
    </div>

    <div class="tbar-right">
      <div class="tbar-group">
        <label class="tbar-label">Theme</label>
        <AppSelect v-model="theme" :options="themeOptions" size="sm" />
      </div>

      <div class="tbar-group">
        <label class="tbar-label">Accent</label>
        <AppToggle v-model="accentOn" label="on" size="sm" class="tbar-accent-toggle" />
        <div v-if="accentOn" class="tbar-swatches">
          <button
            v-if="!gradient"
            v-for="c in SOLIDS"
            :key="c"
            type="button"
            class="tbar-swatch"
            :class="{ on: solid === c }"
            :style="{ background: c }"
            :title="c"
            @click="solid = c"
          />
          <input v-if="!gradient" v-model="solid" type="color" class="tbar-custom" title="Custom colour" />
          <div v-else class="tbar-gradient">
            <input v-model="from" type="color" title="Gradient from" />
            <input v-model="to" type="color" title="Gradient to" />
          </div>
          <AppToggle v-model="gradient" label="gradient" size="sm" />
        </div>
      </div>

      <AppButton size="sm" variant="secondary" icon="info" @click="notify('info', 'Welcome to the Vue de monde playground')">
        Notify
      </AppButton>
    </div>
  </header>
</template>

<style scoped>
.tbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 18px;
  margin: -24px -32px 24px;
  background: color-mix(in srgb, var(--surface-1) 88%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
}
.tbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tbar-logo {
  color: var(--accent);
}
.tbar-title {
  font-weight: var(--fw-700);
  font-size: var(--fs-14);
}
.tbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.tbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tbar-label {
  font-size: var(--fs-12);
  color: var(--text-3);
}
.tbar-swatches {
  display: flex;
  align-items: center;
  gap: 6px;
}
.tbar-swatch {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-sm);
  border: 2px solid transparent;
  cursor: pointer;
}
.tbar-swatch.on {
  border-color: var(--text);
  box-shadow: 0 0 0 2px var(--surface-1);
}
.tbar-custom {
  width: 26px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: transparent;
}
.tbar-gradient {
  display: flex;
  gap: 4px;
}
.tbar-gradient input {
  width: 24px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: transparent;
}
</style>
