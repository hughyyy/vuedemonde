<script setup lang="ts">
import { computed, ref } from "vue";
import {
  AppBadge,
  AppButton,
  AppChip,
  AppIcon,
  AppInput,
  AppMessage,
  AppPanel,
  AppProgress,
  AppToggle,
  Divider,
  Skeleton,
} from "@vuedemonde";

/**
 * Live preview for the theme builder — the real kit, arranged as the app shell
 * it is meant to theme:
 *
 *   --bg          page chrome (top bar, page behind everything)
 *   --surface-1   top bar / sidebar / cards
 *   --canvas-bg   the work area the cards sit *on*
 *   --overlay     modal scrim
 *
 * The draft is applied as inline custom properties on this subtree only: the
 * builder chrome keeps the shipped theme, so a broken draft can never make the
 * tool itself unusable.
 */
const props = defineProps<{ mode: "dark" | "light"; tokens: Record<string, string> }>();

const text = "Preview text";
const field = ref("hello@vuedemonde.dev");
const on = ref(true);
const note = ref("<p>Rich text sits on <code>canvas-bg</code>.</p>");

const vars = computed(() => {
  const style: Record<string, string> = { colorScheme: props.mode };
  for (const [token, value] of Object.entries(props.tokens)) style[`--${token}`] = value;
  return style;
});

const NAV = ["Overview", "Deploys", "Logs", "Settings"] as const;
</script>

<template>
  <div class="bvp" :data-preview-mode="mode" :style="vars">
    <header class="bvp__topbar">
      <span class="bvp__brand"><AppIcon name="theme" :size="14" /> Console</span>
      <div class="bvp__topbar-actions">
        <AppButton size="sm" variant="ghost">Docs</AppButton>
        <AppButton size="sm">Deploy</AppButton>
      </div>
    </header>

    <div class="bvp__shell">
      <aside class="bvp__sidebar">
        <span class="bvp__sidebar-label">Workspace</span>
        <a
          v-for="(item, i) in NAV"
          :key="item"
          class="bvp__nav"
          :class="{ 'is-active': i === 1 }"
          href="#"
          @click.prevent
        >
          {{ item }}
        </a>
        <span class="bvp__sidebar-foot">surface-1</span>
      </aside>

      <main class="bvp__canvas">
        <div class="bvp__canvas-head">
          <div>
            <h2 class="bvp__canvas-title">Deploys</h2>
            <p class="bvp__canvas-sub">canvas-bg · the work area cards sit on</p>
          </div>
          <div class="bvp__row">
            <AppChip tint="accent" icon="sparkle">accent chip</AppChip>
            <AppChip tint="neutral">neutral</AppChip>
          </div>
        </div>

        <div class="bvp__grid">
          <AppPanel title="Type ladder" subtitle="text · text-2 · text-3 · disabled">
            <p class="bvp__t1">{{ text }}</p>
            <p class="bvp__t2">{{ text }}</p>
            <p class="bvp__t3">{{ text }}</p>
            <p class="bvp__t4">Disabled text</p>
            <Divider />
            <p class="bvp__link">
              <a href="#" @click.prevent>a link</a> uses <code>--link</code>;
              <em class="bvp__reasoning">reasoning text</em> uses <code>--reasoning</code>.
            </p>
            <p class="bvp__note">Neither token is consumed by a kit component yet — they only affect your own styles.</p>
          </AppPanel>

          <AppPanel title="Surfaces" subtitle="surface-1 / 2 / 3 over canvas">
            <div class="bvp__surfaces">
              <div class="bvp__surface bvp__surface--1">1</div>
              <div class="bvp__surface bvp__surface--2">2</div>
              <div class="bvp__surface bvp__surface--3">3</div>
            </div>
            <AppMessage kind="info">
              Cards are <code>surface-1</code>; the gap between them is
              <code>canvas-bg</code>.
            </AppMessage>
          </AppPanel>

          <AppPanel title="Actions" subtitle="accent + ink + strong">
            <div class="bvp__row bvp__row--wrap">
              <AppButton>Primary</AppButton>
              <AppButton variant="secondary">Secondary</AppButton>
              <AppButton variant="ghost">Ghost</AppButton>
              <AppButton variant="danger">Danger</AppButton>
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
              <AppProgress :value="64" label="Progress" />
              <Skeleton width="60%" />
            </div>
          </AppPanel>

          <AppPanel title="Elevation & modal" subtitle="shadow-raised / overlay / modal">
            <div class="bvp__shadows">
              <div class="bvp__shadow bvp__shadow--raised">raised</div>
              <div class="bvp__shadow bvp__shadow--overlay">overlay</div>
            </div>
            <div class="bvp__modal-sample">
              <div class="bvp__scrim" aria-hidden="true" />
              <div class="bvp__dialog">
                <span class="bvp__dialog-title">Delete deploy?</span>
                <span class="bvp__dialog-body">Scrim is <code>--overlay</code>, panel is <code>surface-1</code>.</span>
                <span class="bvp__dialog-actions">
                  <AppButton size="sm" variant="ghost">Cancel</AppButton>
                  <AppButton size="sm" variant="danger">Delete</AppButton>
                </span>
              </div>
            </div>
          </AppPanel>

          <AppPanel title="Rich text" subtitle="the one component on canvas-bg">
            <div class="bvp__editor">
              <div class="bvp__editor-bar">
                <AppButton size="sm" variant="ghost" icon="edit" aria-label="Bold" />
                <AppButton size="sm" variant="ghost" icon="copy" aria-label="Copy" />
                <span class="bvp__editor-hint">--font-mono</span>
              </div>
              <pre class="bvp__editor-body">{{ note }}</pre>
            </div>
          </AppPanel>
        </div>

        <footer class="bvp__status">
          <span>status bar · <code>surface-2</code></span>
          <AppBadge tint="ok">healthy</AppBadge>
        </footer>
      </main>
    </div>
  </div>
</template>

<style scoped>
.bvp {
  /* `--bg` is the app chrome behind everything; the shell sits on it. */
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  font-family: var(--font-body);
  color: var(--text);
}
.bvp__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--surface-1);
  border-bottom: 1px solid var(--line);
}
.bvp__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font: 600 var(--fs-13)/1 var(--font-body);
}
.bvp__topbar-actions {
  display: flex;
  gap: var(--space-2);
}
.bvp__shell {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr);
  min-height: 0;
}
@media (max-width: 900px) {
  .bvp__shell {
    grid-template-columns: minmax(0, 1fr);
  }
  .bvp__sidebar {
    display: none;
  }
}
.bvp__sidebar {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3);
  background: var(--surface-1);
  border-right: 1px solid var(--line);
}
.bvp__sidebar-label {
  font: 600 10px/1 var(--font-body);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: var(--space-2);
}
.bvp__nav {
  padding: 5px var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-size: var(--fs-12);
  text-decoration: none;
}
.bvp__nav:hover {
  background: var(--nav-hover-bg);
  color: var(--text);
}
.bvp__nav.is-active {
  background: var(--surface-2);
  color: var(--text);
}
.bvp__sidebar-foot {
  margin-top: auto;
  padding-top: var(--space-3);
  font: 500 10px/1 var(--font-mono);
  color: var(--text-3);
}
.bvp__canvas {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--canvas-bg);
  min-width: 0;
}
.bvp__canvas-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.bvp__canvas-title {
  margin: 0;
  font: 600 var(--fs-16)/1.2 var(--font-body);
  color: var(--text);
}
.bvp__canvas-sub {
  margin: 2px 0 0;
  font-size: var(--fs-12);
  color: var(--text-3);
}
.bvp__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
.bvp__link {
  margin: var(--space-2) 0 0;
  font-size: var(--fs-12);
  color: var(--text-2);
}
.bvp__link a {
  color: var(--link);
}
.bvp__reasoning {
  color: var(--reasoning);
  font-style: italic;
}
.bvp__note {
  margin: var(--space-1) 0 0;
  font-size: 11px;
  color: var(--text-3);
}
.bvp__surfaces {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}
.bvp__surface {
  height: 48px;
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
.bvp__row--wrap {
  flex-wrap: wrap;
}
.bvp__row--stack {
  flex-direction: column;
  align-items: stretch;
}
.bvp__shadows {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
}
.bvp__shadow {
  display: grid;
  place-items: center;
  height: 40px;
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
/* Modal specimen: a clipped scrim over canvas colours, with a real panel. */
.bvp__modal-sample {
  position: relative;
  margin-top: var(--space-3);
  height: 132px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background:
    linear-gradient(var(--accent-soft), var(--accent-soft)),
    repeating-linear-gradient(45deg, var(--canvas-bg) 0 10px, var(--surface-2) 10px 20px);
  overflow: hidden;
  display: grid;
  place-items: center;
}
.bvp__scrim {
  position: absolute;
  inset: 0;
  background: var(--overlay);
}
.bvp__dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: min(260px, 88%);
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  box-shadow: var(--shadow-modal);
}
.bvp__dialog-title {
  font: 600 var(--fs-13)/1.3 var(--font-body);
  color: var(--text);
}
.bvp__dialog-body {
  font-size: 11px;
  line-height: 1.4;
  color: var(--text-2);
}
.bvp__dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-1);
}
.bvp__editor {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.bvp__editor-bar {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: var(--surface-2);
  border-bottom: 1px solid var(--line);
}
.bvp__editor-hint {
  margin-left: auto;
  font: 500 10px/1 var(--font-mono);
  color: var(--text-3);
}
.bvp__editor-body {
  margin: 0;
  padding: var(--space-2);
  background: var(--canvas-bg);
  color: var(--text-2);
  font: 400 11px/1.6 var(--font-mono);
  white-space: pre-wrap;
}
.bvp__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-1) var(--space-3);
  background: var(--surface-2);
  border-top: 1px solid var(--divider);
  color: var(--text-3);
  font-size: 11px;
}
</style>
