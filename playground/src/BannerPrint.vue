<script setup lang="ts">
import { ref } from "vue";
import { AppBadge, AppButton, AppChip, AppIcon, AppInput, AppToggle, THEME_LABELS } from "@vuedemond";

/**
 * Theme-showcase banner — the release-rendering harness (Tier 1).
 * Rendered under `?print=banner`; each card is a `data-theme` island so one
 * screenshot pass shows every theme. Consumed by scripts/render-release.mjs.
 *
 * Layout: two rows of 8 theme cards — the dark themes first, then the
 * remaining themes with all light themes grouped together at the end.
 */

const input = ref("Hello vuedemond");
const on = ref(true);

const rows = [
  ["dark", "late-night", "thermal", "neon-cyberpunk", "grunge", "granite", "classic", "high-contrast"],
  ["bubblegum", "matrix", "shining-gold", "light", "pure-platinum", "mint", "sunshine", "monotone"],
] as const;

const iconNames = ["star", "check", "bell", "chart", "calendar"] as const;
</script>

<template>
  <div id="banner" class="banner">
    <div v-for="(row, ri) in rows" :key="ri" class="banner__row">
      <div v-for="id in row" :key="id" class="banner__col" :data-theme="id">
        <h2 class="banner__title">{{ THEME_LABELS[id].split(" (")[0] }}</h2>
        <div class="banner__row-inner">
          <span class="banner__label">Button</span>
          <div class="banner__stack">
            <AppButton>Primary</AppButton>
            <AppButton variant="secondary">Secondary</AppButton>
            <AppButton variant="ghost">Ghost</AppButton>
            <AppButton variant="danger">Danger</AppButton>
          </div>
        </div>
        <div class="banner__row-inner">
          <span class="banner__label">Input</span>
          <AppInput v-model="input" placeholder="Type…" />
        </div>
        <div class="banner__row-inner">
          <span class="banner__label">Pills</span>
          <div class="banner__stack">
            <AppBadge tint="ok">ok</AppBadge>
            <AppBadge tint="warn">warn</AppBadge>
            <AppBadge tint="err">err</AppBadge>
            <AppChip tint="accent">chip</AppChip>
          </div>
        </div>
        <div class="banner__row-inner">
          <span class="banner__label">Toggle</span>
          <div class="banner__stack"><AppToggle v-model="on" label="Live" /></div>
        </div>
        <div class="banner__row-inner">
          <span class="banner__label">Icons</span>
          <div class="banner__icons">
            <AppIcon v-for="n in iconNames" :key="n" :name="n" :size="16" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
}
.banner__row {
  display: flex;
  gap: var(--space-4);
}
.banner__col {
  width: 152px;
  flex: none;
  padding: var(--space-4);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--bg);
  color: var(--text);
}
.banner__title {
  margin: 0 0 var(--space-4);
  font-size: var(--fs-14);
  font-weight: var(--fw-600);
  color: var(--text);
}
.banner__row-inner + .banner__row-inner {
  margin-top: var(--space-4);
}
.banner__label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--fs-12);
  color: var(--text-3);
}
.banner__stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}
.banner__icons {
  display: flex;
  gap: var(--space-3);
  color: var(--text-2);
}
</style>
