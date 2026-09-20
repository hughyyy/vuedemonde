<script setup lang="ts">
import { ref } from "vue";

/**
 * D3 — the shared labelled-section primitive for grouping node-panel controls
 * into scannable sections (Identification · Execution · Looping · Inputs ·
 * Outputs · …). A labelled, collapsible panel group; reused everywhere so the
 * grouping markup stays consistent.
 */
defineProps<{ title: string }>();
const open = ref(true);
</script>

<template>
  <section class="pane-section">
    <button
      class="pane-section-head"
      type="button"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="pane-section-caret" aria-hidden="true">{{ open ? "▾" : "▸" }}</span>
      <span class="pane-section-title">{{ title }}</span>
    </button>
    <div v-show="open" class="pane-section-body pgroup">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.pane-section { margin: 6px 0; }
.pane-section-head {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 3px 4px;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
  text-align: left;
}
.pane-section-caret { font-size: 10px; color: var(--muted); }
.pane-section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-strong);
  font-weight: 700;
}
.pane-section-body { padding-top: 6px; }
</style>
