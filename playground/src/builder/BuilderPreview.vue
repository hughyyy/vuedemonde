<script setup lang="ts">
import { computed, ref } from "vue";
import {
  AppBadge,
  AppButton,
  AppChip,
  AppInput,
  AppMessage,
  AppPanel,
  AppProgress,
  AppToggle,
  Divider,
  Skeleton,
} from "@vuedemonde";

/**
 * Live preview for the theme builder — real kit components, so what you see is
 * the library rendering the tokens being edited. The draft is applied as inline
 * custom properties on this subtree only: the builder chrome keeps the shipped
 * theme, so a broken draft can never make the tool itself unusable.
 */
const props = defineProps<{ mode: "dark" | "light"; tokens: Record<string, string> }>();

const text = "Preview text";
const field = ref("hello@vuedemonde.dev");
const on = ref(true);

const vars = computed(() => {
  const style: Record<string, string> = { colorScheme: props.mode };
  for (const [token, value] of Object.entries(props.tokens)) style[`--${token}`] = value;
  return style;
});
</script>

<template>
  <div class="bvp" :data-preview-mode="mode" :style="vars">
    <div class="bvp__canvas">
      <p class="bvp__eyebrow">canvas-bg</p>
    </div>

    <div class="bvp__grid">
      <AppPanel title="Type ladder" subtitle="text · text-2 · text-3 · disabled">
        <p class="bvp__t1">{{ text }}</p>
        <p class="bvp__t2">{{ text }}</p>
        <p class="bvp__t3">{{ text }}</p>
        <p class="bvp__t4">Disabled text</p>
      </AppPanel>

      <AppPanel title="Surfaces" subtitle="surface-1 / 2 / 3">
        <div class="bvp__surfaces">
          <div class="bvp__surface bvp__surface--1">1</div>
          <div class="bvp__surface bvp__surface--2">2</div>
          <div class="bvp__surface bvp__surface--3">3</div>
        </div>
      </AppPanel>

      <AppPanel title="Actions" subtitle="accent + ink + strong">
        <div class="bvp__row">
          <AppButton>Primary</AppButton>
          <AppButton variant="secondary">Secondary</AppButton>
          <AppButton variant="ghost">Ghost</AppButton>
          <AppButton variant="danger">Danger</AppButton>
        </div>
        <div class="bvp__row">
          <AppChip tint="accent" icon="sparkle">accent chip</AppChip>
          <AppChip tint="neutral">neutral</AppChip>
        </div>
      </AppPanel>

      <AppPanel title="Status" subtitle="ok / warn / err / run / info on soft tints">
        <div class="bvp__row bvp__row--wrap">
          <AppBadge tint="ok">ok</AppBadge>
          <AppBadge tint="warn">warn</AppBadge>
          <AppBadge tint="err">err</AppBadge>
          <AppBadge tint="run">run</AppBadge>
          <AppBadge tint="info">info</AppBadge>
        </div>
        <AppMessage kind="ok">Saved successfully.</AppMessage>
        <AppMessage kind="err">Something went wrong.</AppMessage>
      </AppPanel>

      <AppPanel title="Form" subtitle="line · divider · focus-ring">
        <div class="bvp__row bvp__row--stack">
          <AppInput v-model="field" label="Email" hint="We never share it." />
          <AppToggle v-model="on" label="Enabled" />
          <Divider />
          <AppProgress :value="64" label="Progress" />
          <Skeleton width="60%" />
        </div>
      </AppPanel>

      <AppPanel title="Elevation" subtitle="shadow-raised / overlay / modal" elevation="raised">
        <div class="bvp__shadows">
          <div class="bvp__shadow bvp__shadow--raised">raised</div>
          <div class="bvp__shadow bvp__shadow--overlay">overlay</div>
          <div class="bvp__shadow bvp__shadow--modal">modal</div>
        </div>
        <div class="bvp__overlay">
          <span>overlay scrim over canvas</span>
        </div>
      </AppPanel>
    </div>
  </div>
</template>

<style scoped>
.bvp {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.bvp__canvas {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--canvas-bg);
  padding: var(--space-3) var(--space-4);
}
.bvp__eyebrow {
  margin: 0;
  font: 500 var(--fs-12)/1 var(--font-body);
  color: var(--text-3);
}
.bvp__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-3);
  align-items: start;
}
.bvp__t1 {
  margin: 0;
  color: var(--text);
}
.bvp__t2 {
  margin: 0;
  color: var(--text-2);
}
.bvp__t3 {
  margin: 0;
  color: var(--text-3);
}
.bvp__t4 {
  margin: 0;
  color: var(--text-disabled);
}
.bvp__surfaces {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}
.bvp__surface {
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  color: var(--text-2);
  font: 600 var(--fs-12)/1 var(--font-mono);
}
.bvp__surface--1 {
  background: var(--surface-1);
}
.bvp__surface--2 {
  background: var(--surface-2);
}
.bvp__surface--3 {
  background: var(--surface-3);
}
.bvp__row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.bvp__row + .bvp__row {
  margin-top: var(--space-3);
}
.bvp__row--wrap {
  flex-wrap: wrap;
}
.bvp__row--stack {
  flex-direction: column;
  align-items: stretch;
}
.bvp__shadows {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
.bvp__shadow {
  display: grid;
  place-items: center;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--text-3);
  font: 500 var(--fs-12)/1 var(--font-body);
}
.bvp__shadow--raised {
  box-shadow: var(--shadow-raised);
}
.bvp__shadow--overlay {
  box-shadow: var(--shadow-overlay);
}
.bvp__shadow--modal {
  box-shadow: var(--shadow-modal);
}
.bvp__overlay {
  margin-top: var(--space-3);
  display: grid;
  place-items: center;
  height: 54px;
  border-radius: var(--radius-md);
  color: var(--text-2);
  font: 500 var(--fs-12)/1 var(--font-body);
  background:
    linear-gradient(var(--overlay), var(--overlay)),
    linear-gradient(120deg, var(--accent), var(--accent-2));
}
</style>
