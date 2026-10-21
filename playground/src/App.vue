<script setup lang="ts">
import { onMounted } from "vue";
import ThemeBar from "./ThemeBar.vue";
import BannerPrint from "./BannerPrint.vue";
import { ConfirmDialog, DialogHost, ToastHost } from "@vuedemond";
import PrimitivesSection from "./sections/PrimitivesSection.vue";
import InputsSection from "./sections/InputsSection.vue";
import OverlaysSection from "./sections/OverlaysSection.vue";
import NavigationSection from "./sections/NavigationSection.vue";
import DataSection from "./sections/DataSection.vue";
import LayoutSection from "./sections/LayoutSection.vue";
import ChartsSection from "./sections/ChartsSection.vue";
import CalendarSection from "./sections/CalendarSection.vue";
import BoardSection from "./sections/BoardSection.vue";

const sections = [
  { id: "primitives", label: "Primitives", comp: PrimitivesSection },
  { id: "inputs", label: "Inputs & Forms", comp: InputsSection },
  { id: "overlays", label: "Overlays & Feedback", comp: OverlaysSection },
  { id: "navigation", label: "Navigation", comp: NavigationSection },
  { id: "data", label: "Data Display", comp: DataSection },
  { id: "layout", label: "Layout", comp: LayoutSection },
  { id: "charts", label: "Charts", comp: ChartsSection },
  { id: "calendar", label: "Calendar", comp: CalendarSection },
  { id: "board", label: "Board", comp: BoardSection },
] as const;

/* Print routes for scripts/render-release.mjs:
 *   ?print=banner              → theme-showcase banner islands (BannerPrint)
 *   ?print=family&id=X&theme=T → one section only, theme applied before paint */
const printParams = new URLSearchParams(location.search);
const printMode = printParams.get("print");
const printTheme = printParams.get("theme");
if (printMode === "family" && printTheme) document.documentElement.dataset.theme = printTheme;
if (printMode === "family") document.documentElement.dataset.print = "";
const printSection = printMode === "family" ? sections.find((s) => s.id === printParams.get("id")) ?? null : null;

function scrollTo(id: string): void {
  document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

onMounted(() => {
  if (printMode) return; // print routes own their theme; never restore over it
  // restore the last-used theme/accent when the page reloads
  const theme = localStorage.getItem("vuedemond-theme");
  if (theme) document.documentElement.dataset.theme = theme;
});
</script>

<template>
  <BannerPrint v-if="printMode === 'banner'" />
  <div v-else-if="printSection" id="print-section" class="print-wrap">
    <component :is="printSection.comp" :print="printMode === 'family'" />
  </div>
  <div v-else class="pg">
    <ConfirmDialog />
    <DialogHost />
    <ToastHost />
    <aside class="pg-side">
      <div class="pg-brand">
        <span class="pg-brand-mark">◆</span>
        <div>
          <h1 class="pg-brand-name">vuedemond</h1>
          <p class="pg-brand-sub">Vue 3 · token-driven · zero-dependency kit</p>
        </div>
      </div>
      <nav class="pg-nav">
        <a
          v-for="s in sections"
          :key="s.id"
          class="pg-nav-item"
          href="#"
          @click.prevent="scrollTo(s.id)"
        >
          {{ s.label }}
        </a>
      </nav>
    </aside>

    <main class="pg-main">
      <ThemeBar />
      <section v-for="s in sections" :id="`sec-${s.id}`" :key="s.id" class="pg-section">
        <component :is="s.comp" />
      </section>
      <footer class="pg-foot">
        vuedemond — extracted from the Nexus app's custom UI kit. Components consume
        <code>var(--…)</code> tokens from <code>theme.css</code>; theme and accent are runtime switches.
      </footer>
    </main>
  </div>
</template>

<style>
/* App shell only — everything else is token-driven. */
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}
code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--surface-2);
  padding: 1px 5px;
  border-radius: var(--radius-sm);
}
button {
  font-family: inherit;
}
.pg {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}
.pg-side {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 20px 16px;
  background: var(--surface-1);
  border-right: 1px solid var(--line);
  overflow-y: auto;
}
.pg-brand {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 22px;
}
.pg-brand-mark {
  color: var(--accent);
  font-size: 22px;
}
.pg-brand-name {
  margin: 0;
  font-size: var(--fs-16);
  font-weight: var(--fw-700);
}
.pg-brand-sub {
  margin: 2px 0 0;
  font-size: var(--fs-12);
  color: var(--text-3);
}
.pg-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pg-nav-item {
  padding: 8px 10px;
  border-radius: var(--radius-md);
  color: var(--text-2);
  font-size: var(--fs-13);
  text-decoration: none;
}
.pg-nav-item:hover {
  background: var(--surface-2);
  color: var(--text);
}
.pg-main {
  padding: 24px 32px 60px;
  max-width: 1100px;
}
.pg-section {
  scroll-margin-top: 16px;
  padding-top: 8px;
}
.pg-foot {
  margin-top: 48px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  color: var(--text-3);
  font-size: var(--fs-12);
}
.print-wrap {
  padding: 24px;
  background: var(--bg);
  color: var(--text);
}
/* In print renders every open overlay is captured at once: the drawer slides
 * in at z 950 (below the dialog scrim 1000) and would be invisible, so the
 * harness raises it and hides its own backdrop — the dialog scrim is the
 * single dimmer, so every open state stays legible. Harness-only — the kit's
 * real z-order is untouched. (Drawer teleports to body, hence html[data-print].) */
html[data-print] .drawer {
  z-index: 1550;
}
html[data-print] .drawer__backdrop {
  display: none;
}
/* Under prefers-reduced-motion the kit zeroes --dur-*; Vue's drawer
 * <Transition> then collapses with a 0ms duration and can stick at the
 * enter-from translate. Pin the panel to its rest position for the render. */
html[data-print] .drawer__panel {
  transform: none !important;
}
</style>
