<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { ansiColorCss, type TermLine, type TermStyle } from "./terminal/ansi";
import { TermSession } from "./terminal/session";
import type { TermSource, TermTransport } from "./terminal/transports";
import AppButton from "./AppButton.vue";
import { luminance } from "../accent";

/**
 * Terminal — reusable kit terminal: a self-built streaming ANSI renderer with
 * pluggable transports (scripted demo, run-live output, server-spawned
 * process), optional tabs, an optional input bar, font-scale zoom, follow-tail
 * scrolling and a token-derived ANSI palette. See
 * docs/spec-terminal-component.md.
 *
 * The "hybrid" contract: the component only ever sees a TermSession +
 * TermTransport — a full xterm.js-class emulator can slot in as a transport
 * later without changing consumers.
 */

const props = withDefaults(
  defineProps<{
    /** Multi-session (tabs). Each source is a transport instance or factory. */
    sources?: TermSource[];
    /** Single-session source (ignored when `sources` is given). */
    transport?: TermTransport;
    /** Single-session label (chromes the tab bar). */
    title?: string;
    /** Show the input bar. Omit = auto (shown iff the transport has `send`);
     * `true` forces it, `false` hides it. (Absent boolean props coerce to
     * `false` in Vue, so this has to be an explicit `boolean | null` tri-state.) */
    withInput?: boolean | null;
    inputPrompt?: string;
    fontSize?: number;
    height?: string;
    scrollback?: number;
    followTail?: boolean;
    /** Prefix each line with its HH:MM:SS arrival time (toolbar checkbox, default on). */
    showTimestamps?: boolean;
    /** Prefix each line with its `[source]` producer tag (combined log feeds). */
    showSource?: boolean;
    /** "auto" picks the light palette for light themes, dark otherwise. */
    theme?: "auto" | "dark" | "light";
  }>(),
  { inputPrompt: "$", fontSize: 13, height: "300px", followTail: true, theme: "auto", withInput: null, showTimestamps: true, showSource: false },
);

const scroller = ref<HTMLElement | null>(null);

/* ---- sessions / transports ----------------------------------------- */

const sessions = shallowRef<TermSession[]>([]);
const transports = new Map<string, TermTransport>();
const activeId = ref("");
/** Per-tab scroll state so switching tabs restores each terminal's position. */
const tabState = new Map<string, { following: boolean; scrollTop: number }>();

const active = computed<TermSession | undefined>(
  () => sessions.value.find((s) => s.id === activeId.value) ?? sessions.value[0],
);
const activeTransport = computed<TermTransport | undefined>(
  () => (active.value ? transports.get(active.value.id) : undefined),
);
/** Input bar visible when explicitly requested, or when the transport can sink input. */
const showInput = computed(() => (props.withInput ?? activeTransport.value?.send != null) && !!active.value);

function resolveSources(): Array<{ id: string; label: string; transport: TermTransport }> {
  const list =
    props.sources && props.sources.length
      ? props.sources
      : props.transport
        ? [{ id: "main", label: props.title ?? "Terminal", transport: props.transport }]
        : [];
  return list.map((s, i) => ({
    id: s.id || `tab-${i}`,
    label: s.label || s.id || `tab-${i}`,
    transport: typeof s.transport === "function" ? s.transport() : s.transport,
  }));
}

function build(): void {
  for (const t of transports.values()) t.dispose();
  transports.clear();
  for (const s of sessions.value) s.dispose();
  tabState.clear();
  const resolved = resolveSources();
  const built = resolved.map((src) => {
    const sess = new TermSession({
      id: src.id,
      label: src.label,
      scrollbackMax: props.scrollback,
      followTail: props.followTail,
    });
    sess.onChange(onSessionChange);
    transports.set(sess.id, src.transport);
    return sess;
  });
  sessions.value = built;
  activeId.value = built[0]?.id ?? "";
  // attach after the active tab is set, so synchronous scripted first-steps
  // already have a rendered target
  for (const s of sessions.value) {
    transports.get(s.id)?.attach({ append: (data, source) => s.append(data, source) });
  }
  nextTick(scrollToBottom);
}

/* ---- viewport / scrolling ------------------------------------------ */

const fontSize = ref(props.fontSize);
/** Bumped on every content change — the rows computed re-slices off it (line
 * objects are plain/non-reactive, so a version bump is the render trigger). */
const version = ref(0);
const following = ref(props.followTail);

/** All of the active session's lines, in flow layout. Rows render in normal
 * document flow (no absolute positioning) so a long line that wraps to several
 * visual rows can never overlap the next one — each logical line contributes
 * its natural height. Index keys force a re-render each tick so CR-overwritten
 * (in-place-mutated) lines update. */
const rows = computed(() => {
  const s = active.value;
  void version.value;
  if (!s) return [];
  const n = s.totalLines;
  const out: TermLine[] = [];
  for (let i = 0; i < n; i++) {
    const line = s.lineAt(i);
    // the trailing in-progress line is always present; drop it when it has no
    // content so a bare timestamp row never appears at the bottom
    if (i === n - 1 && line.runs.every((r) => r.text.length === 0)) continue;
    out.push(line);
  }
  return out;
});

/** Whether a line has any visible text (prefixes like [time]/[source] render
 * only for content-bearing lines, never on a blank trailing line). */
function hasText(line: TermLine): boolean {
  return line.runs.some((r) => r.text.length > 0);
}

function rememberState(s: TermSession): void {
  const el = scroller.value;
  tabState.set(s.id, { following: following.value, scrollTop: el?.scrollTop ?? 0 });
}

function scrollToBottom(): void {
  const el = scroller.value;
  const s = active.value;
  if (!el || !s) return;
  el.scrollTop = el.scrollHeight;
  following.value = true;
  rememberState(s);
}

function onScroll(): void {
  const el = scroller.value;
  const s = active.value;
  if (!el || !s) return;
  following.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
  rememberState(s);
}

function onSessionChange(s: TermSession): void {
  if (s.id !== activeId.value) return;
  version.value++;
  if (following.value) void nextTick(scrollToBottom);
}

function activate(id: string): void {
  const s = sessions.value.find((x) => x.id === id);
  if (!s || id === activeId.value) return;
  if (active.value) rememberState(active.value);
  activeId.value = id;
  version.value++;
  const st = tabState.get(id);
  if (st) {
    following.value = st.following;
    if (scroller.value) scroller.value.scrollTop = st.scrollTop;
  } else {
    following.value = s.followTail;
    void nextTick(scrollToBottom);
  }
}

/* ---- timestamps ----------------------------------------------------- */

/** The per-line arrival-time checkbox state (default on). */
const tsEnabled = ref(props.showTimestamps ?? true);

/** Producer-tag prefixes (on when the feed is a combined multi-source one). */
const sourceEnabled = ref(props.showSource ?? false);

/** HH:MM:SS of a line's start time (empty when the line has none). */
function tsLabel(line: TermLine): string {
  const at = line.startedAt;
  if (!at) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  const d = new Date(at);
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function closeTab(id: string): void {
  const idx = sessions.value.findIndex((s) => s.id === id);
  if (idx < 0) return;
  transports.get(id)?.dispose();
  transports.delete(id);
  sessions.value[idx].dispose();
  tabState.delete(id);
  const next = sessions.value.filter((s) => s.id !== id);
  sessions.value = next;
  if (activeId.value === id) {
    activeId.value = next[Math.min(idx, next.length - 1)]?.id ?? "";
    version.value++;
    void nextTick(scrollToBottom);
  }
}

/* ---- toolbar: zoom / clear / copy ---------------------------------- */

function zoomBy(delta: number): void {
  fontSize.value = Math.min(32, Math.max(8, fontSize.value + delta));
  version.value++;
  if (following.value) void nextTick(scrollToBottom);
}

function resetZoom(): void {
  zoomBy(props.fontSize - fontSize.value);
}

const zoomPercent = computed(() => Math.round((fontSize.value / (props.fontSize || 13)) * 100));

function clearTerm(): void {
  active.value?.clear();
  version.value++;
  void nextTick(scrollToBottom);
}

async function copyTerm(): Promise<void> {
  const text = active.value?.text();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard unavailable (no permission/HTTPS) — ignore */
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (!(e.ctrlKey || e.metaKey)) return;
  if (e.key === "=" || e.key === "+") {
    e.preventDefault();
    zoomBy(1);
  } else if (e.key === "-") {
    e.preventDefault();
    zoomBy(-1);
  } else if (e.key === "0") {
    e.preventDefault();
    resetZoom();
  } else if (e.key === "l" || e.key === "L") {
    e.preventDefault();
    clearTerm();
  }
}

/* ---- input bar ------------------------------------------------------ */

const input = ref("");
function submit(): void {
  const s = active.value;
  if (!s) return;
  const line = input.value;
  if (line) {
    // local echo, then hand the line to the backing process
    s.append(`${props.inputPrompt} ${line}\n`);
    transports.get(s.id)?.send?.(line);
  } else {
    s.append("\n");
  }
  input.value = "";
  void nextTick(scrollToBottom);
}

/* ---- run styling ----------------------------------------------------- */

function runStyle(style: TermStyle): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  let fg: string | undefined;
  let bg: string | undefined;
  if (style.fgRgb) fg = `rgb(${style.fgRgb[0]},${style.fgRgb[1]},${style.fgRgb[2]})`;
  else if (style.fgIndex !== undefined)
    fg = style.fgIndex < 16 ? `var(--term-ansi-${style.fgIndex})` : ansiColorCss(style.fgIndex, []);
  if (style.bgRgb) bg = `rgb(${style.bgRgb[0]},${style.bgRgb[1]},${style.bgRgb[2]})`;
  else if (style.bgIndex !== undefined)
    bg = style.bgIndex < 16 ? `var(--term-ansi-${style.bgIndex})` : ansiColorCss(style.bgIndex, []);
  if (style.inverse) {
    const swap = fg;
    fg = bg ?? fg;
    bg = swap;
  }
  if (fg) out.color = fg;
  if (bg) out.backgroundColor = bg;
  if (style.bold) out.fontWeight = "700";
  if (style.dim) out.opacity = "0.66";
  if (style.italic) out.fontStyle = "italic";
  if (style.underline) out.textDecorationLine = "underline";
  return out;
}

const themeClass = computed(() => {
  const t = props.theme ?? "auto";
  if (t !== "auto") return t;
  return isLightTheme.value ? "light" : "dark";
});

/**
 * Live-track the app theme (`data-theme` on <html>, driven by the shell and the
 * gallery's QA theme switcher) so the ANSI palette follows it.
 *
 * Polarity comes from the *resolved* background, not the theme id: `light` is
 * one id among many light themes (`mint`, `sunshine`, `pure-platinum`,
 * `monotone`, `sakura`, …), so matching the literal id left every other light
 * theme on the dark ANSI palette. `luminance` is the same 0.35 boundary the
 * theme builder uses to pick its ladder.
 */
const isLightTheme = ref(false);
let themeObserver: MutationObserver | undefined;
function syncTheme(): void {
  if (typeof document === "undefined") return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  isLightTheme.value = bg !== "" && luminance(bg) >= 0.35;
}

/* ---- lifecycle ------------------------------------------------------- */

onMounted(() => {
  build();
  syncTheme();
  if (typeof document !== "undefined") {
    themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
});
watch(
  () => props.transport,
  () => {
    if (!props.sources?.length) build();
  },
);
watch(() => props.sources, build);
onBeforeUnmount(() => {
  themeObserver?.disconnect();
  themeObserver = undefined;
  for (const t of transports.values()) t.dispose();
  transports.clear();
  for (const s of sessions.value) s.dispose();
});
</script>

<template>
  <div
    class="terminal"
    :class="[`term-${themeClass}`]"
    :style="{ height, fontSize: `${fontSize}px` }"
    tabindex="-1"
    @keydown="onKeydown"
  >
    <div class="term-bar">
      <div v-if="sessions.length > 1" class="term-tabs" role="tablist" aria-label="Terminal sessions">
        <button
          v-for="s in sessions"
          :key="s.id"
          class="term-tab"
          :class="{ active: s.id === activeId }"
          role="tab"
          :aria-selected="s.id === activeId"
          @click="activate(s.id)"
        >
          {{ s.label }}
          <AppButton
            v-if="sessions.length > 1"
            class="term-tab-close"
            size="sm"
            variant="ghost"
            icon="close"
            title="Close this terminal session"
            @click.stop="closeTab(s.id)"
          />
        </button>
      </div>
      <div class="term-spacer" />
      <label class="term-ts-toggle" title="Prefix each line with its arrival time">
        <input v-model="tsEnabled" type="checkbox" /> ts
      </label>
      <AppButton size="sm" variant="ghost" title="Zoom out (Ctrl+-)" @click="zoomBy(-1)">A−</AppButton>
      <span class="term-zoom" :title="`${zoomPercent}% font scale`">{{ zoomPercent }}%</span>
      <AppButton size="sm" variant="ghost" title="Zoom in (Ctrl+=)" @click="zoomBy(1)">A+</AppButton>
      <AppButton size="sm" variant="ghost" icon="trash" title="Clear terminal (Ctrl+L)" @click="clearTerm" />
      <AppButton size="sm" variant="ghost" icon="copy" title="Copy terminal text" @click="copyTerm" />
    </div>

    <div ref="scroller" class="term-view" @scroll.passive="onScroll">
      <div class="term-content">
        <div v-for="(line, i) in rows" :key="i" class="term-row">
          <span v-if="sourceEnabled && line.source && hasText(line)" class="term-src">[{{ line.source }}]</span>
          <span v-if="tsEnabled && line.startedAt && hasText(line)" class="term-ts">[{{ tsLabel(line) }}]</span>
          <template v-for="(r, ri) in line.runs" :key="ri">
            <span class="term-run" :style="runStyle(r.style)">{{ r.text }}</span>
          </template>
        </div>
      </div>
      <button v-if="!following" class="term-jump" type="button" title="Jump to latest output" @click="scrollToBottom">
        ⤓ latest
      </button>
    </div>

    <div v-if="showInput" class="term-input-row">
      <span class="term-prompt">{{ inputPrompt }}</span>
      <input
        v-model="input"
        class="term-input"
        type="text"
        spellcheck="false"
        autocomplete="off"
        aria-label="Terminal input"
        @keydown.enter.prevent="submit"
      />
    </div>
  </div>
</template>

<style scoped>
.terminal {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border: 1px solid var(--divider);
  border-radius: var(--radius-md, 8px);
  background: var(--term-bg);
  color: var(--term-fg);
  font-family: var(--font-mono);
  overflow: hidden;
  outline: none;
  /* ANSI palette — base dark palette, overridden by .term-light below. */
  --term-ansi-0: #000000;
  --term-ansi-1: #cd3131;
  --term-ansi-2: #0dbc79;
  --term-ansi-3: #e5e510;
  --term-ansi-4: #2472c8;
  --term-ansi-5: #bc3fbc;
  --term-ansi-6: #11a8cd;
  --term-ansi-7: #e5e5e5;
  --term-ansi-8: #666666;
  --term-ansi-9: #f14c4c;
  --term-ansi-10: #23d18b;
  --term-ansi-11: #f5f543;
  --term-ansi-12: #3b8eea;
  --term-ansi-13: #d670d6;
  --term-ansi-14: #29b8db;
  --term-ansi-15: #ffffff;
}

.terminal:focus-visible {
  box-shadow: 0 0 0 var(--focus-ring-width, 2px) var(--focus-ring, var(--accent-strong));
}

.term-light {
  --term-bg: #ffffff;
  --term-fg: #1b2330;
  --term-ansi-0: #3f4a56;
  --term-ansi-7: #1b2330;
  --term-ansi-8: #6b7684;
  --term-ansi-15: #0b0f14;
}

.term-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px 6px;
  background: var(--surface-1);
  border-bottom: 1px solid var(--divider);
  flex-wrap: wrap;
}

.term-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow-x: auto;
  max-width: 100%;
}

.term-tab {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: var(--text-2);
  font: 500 var(--fs-11, 11px)/1.5 var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.term-tab:hover:not(.active) {
  color: var(--text);
  background: var(--surface-2);
}

.term-tab.active {
  color: var(--text);
  background: var(--surface-2);
  border-color: var(--line);
}

.term-tab-close {
  margin-left: 1px;
  opacity: 0.7;
}
.term-tab:hover .term-tab-close,
.term-tab.active .term-tab-close {
  opacity: 1;
}

.term-spacer {
  flex: 1;
  min-width: 4px;
}

.term-zoom {
  font: 600 10px/1 var(--font-body);
  color: var(--text-3);
  min-width: 30px;
  text-align: center;
}

.term-ts-toggle {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font: 500 11px/1.2 var(--font-body);
  color: var(--text-3);
  cursor: pointer;
  user-select: none;
}

.term-view {
  position: relative;
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  background: var(--term-bg);
  scrollbar-width: thin;
  scrollbar-color: var(--line) transparent;
}

.term-content {
  width: 100%;
}

/* Rows are in normal flow (not absolute) so a wrapped long line keeps its
 * natural height and can never overlap the next row. */
.term-row {
  display: block;
  padding: 0 8px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.45;
}

.term-run {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.term-ts {
  display: inline-block;
  margin-right: 8px;
  color: var(--text-3);
  font-size: 0.85em;
  opacity: 0.8;
  user-select: none;
}

.term-src {
  display: inline-block;
  margin-right: 8px;
  color: var(--accent-strong, var(--accent));
  font-size: 0.85em;
  font-weight: 600;
  user-select: none;
}

.term-jump {
  position: sticky;
  bottom: 8px;
  left: 8px;
  margin-top: -30px;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 3px 10px;
  background: var(--surface-2);
  color: var(--text-2);
  font: 600 var(--fs-11, 11px)/1.4 var(--font-body);
  cursor: pointer;
}

.term-jump:hover {
  color: var(--text);
  border-color: var(--accent-strong);
}

.term-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-top: 1px solid var(--divider);
  background: var(--surface-1);
}

.term-prompt {
  color: var(--ok, var(--accent-strong));
  font-weight: 700;
  user-select: none;
}

.term-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--term-fg);
  font: inherit;
}

.term-input::placeholder {
  color: var(--text-disabled);
}
</style>
