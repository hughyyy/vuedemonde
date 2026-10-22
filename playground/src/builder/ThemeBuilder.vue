<script setup lang="ts">
/**
 * Theme builder (`?build`).
 *
 * Author the 13 anchors, derive the other 21 tokens, unlock any of them, watch
 * a live preview on the real kit, and export a stylesheet block in one of three
 * forms — selectable (`[data-theme]`), fixed (`:root`), or default
 * (`:root:not([data-theme])`).
 *
 * Preview mechanics: resolved tokens are written inline on
 * `document.documentElement`. Inline custom properties beat every
 * `[data-theme]` block, so the preview is the truth for teleported overlays
 * too. The previous inline values are restored on unmount.
 */
import { computed, onMounted, ref, watch } from "vue";
import {
  AppButton,
  AppMessage,
  AppPanel,
  AppToggle,
  Fieldset,
  THEME_IDS,
  THEME_LABELS,
  parseHex,
  withAlpha,
} from "@vuedemonde";
import {
  ANCHOR_GROUPS,
  DERIVED_GROUPS,
  THEME_TOKEN_ORDER,
  decodeSpec,
  defaultSpec,
  emitRegistration,
  emitThemeBlock,
  emitUsage,
  encodeSpec,
  modeFor,
  parseThemeCss,
  resolveTheme,
  specFromTokens,
  validateTheme,
  type AnchorName,
  type ExportMode,
  type ThemeSpec,
  type TokenName,
} from "./theme-spec";
import themeCss from "@vuedemonde/theme.css?raw";
import BuilderPreview from "./BuilderPreview.vue";

/* ---- state ---- */

const spec = ref<ThemeSpec>(defaultSpec());
const exportMode = ref<ExportMode>("selectable");
const showAll = ref(false);
const copied = ref<string | null>(null);

const shipped = parseThemeCss(themeCss);

const ANCHOR_LABELS: Record<AnchorName, string> = {
  bg: "Background",
  "surface-1": "Surface 1 (cards)",
  "canvas-bg": "Canvas background",
  text: "Primary text",
  accent: "Accent",
  "accent-2": "Accent 2 (gradient end)",
  ok: "Success",
  warn: "Warning",
  err: "Danger",
  run: "Running",
  info: "Info",
  link: "Link",
  reasoning: "Reasoning",
};


const resolved = computed(() => resolveTheme(spec.value));
const findings = computed(() => validateTheme(spec.value));
const errors = computed(() => findings.value.filter((f) => f.level === "error"));
const warnings = computed(() => findings.value.filter((f) => f.level === "warn"));
const block = computed(() => emitThemeBlock(spec.value, exportMode.value));
const usage = computed(() => emitUsage(exportMode.value, `${spec.value.id || "my-theme"}.css`));
const registration = computed(() => emitRegistration(spec.value));


/** Shadows are whole CSS values (`0 1px 2px rgba(…)`), so they edit as text. */
const SHADOW_TOKENS: Record<string, true> = {
  "shadow-raised": true,
  "shadow-overlay": true,
  "shadow-modal": true,
};

const editable = computed(() =>
  DERIVED_GROUPS.map((group) => ({
    legend: group.legend,
    tokens: group.tokens.filter((t) => {
      if (showAll.value) return true;
      return spec.value.overrides[t] !== undefined;
    }),
  })).filter((g) => g.tokens.length > 0),
);

/*
 * The draft is applied to the preview subtree only. Painting `documentElement`
 * would preview teleported overlays too, but it also re-skins this page — a
 * draft with broken contrast would make its own reset button unreadable, and
 * the inline values would outlive the component. The builder chrome therefore
 * keeps the shipped theme; the preview pane carries the draft.
 */
onMounted(() => {
  // Shareable state wins over localStorage: a link must reproduce the theme.
  if (location.hash.startsWith("#spec=")) {
    const shared = decodeSpec(location.hash.replace(/^#spec=/, ""));
    if (shared) spec.value = shared;
    return;
  }
  const stored = localStorage.getItem("vuedemonde-builder");
  if (!stored) return;
  const parsed = decodeSpec(stored);
  if (parsed) spec.value = parsed;
});
/* ---- actions ---- */

function setAnchor(key: AnchorName, value: string): void {
  if (!parseHex(value)) return;
  spec.value = { ...spec.value, anchors: { ...spec.value.anchors, [key]: value.trim() } };
}

/**
 * Ids end up inside a CSS selector, so they are normalised to `[a-z0-9-]` as the
 * user types. An empty id would emit `[data-theme=""]` (which matches nothing),
 * and reusing a shipped id would shadow that theme, so both are reported.
 */
const idProblem = computed(() => {
  if (!spec.value.id) return "Required — the selector would match nothing.";
  if (shipped.some((theme) => theme.id === spec.value.id)) {
    return `Shadows the shipped "${spec.value.id}" theme.`;
  }
  return "";
});

function renameTheme(raw: string): void {
  const id = raw.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  spec.value = { ...spec.value, id };
}

/** The colour an input shows: the override when unlocked, else the derivation. */
function derivedHex(token: TokenName): string {
  const value = resolved.value[token];
  const hex = /^#[0-9a-f]{6}$/i.exec(value);
  if (hex) return value;
  const rgb = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(value);
  if (!rgb) return "#000000";
  return `#${[1, 2, 3].map((i) => Number(rgb[i]).toString(16).padStart(2, "0")).join("")}`;
}

/** Commit an anchor hex field; invalid text reverts the input to the anchor. */
function commitAnchor(key: AnchorName, event: Event): void {
  const input = event.target as HTMLInputElement;
  const value = input.value.trim();
  if (!parseHex(value)) {
    input.value = spec.value.anchors[key];
    return;
  }
  setAnchor(key, value);
}

function isOverridden(token: TokenName): boolean {
  return spec.value.overrides[token] !== undefined;
}

function toggleOverride(token: TokenName): void {
  const overrides = { ...spec.value.overrides };
  if (overrides[token] !== undefined) delete overrides[token];
  else overrides[token] = resolved.value[token];
  spec.value = { ...spec.value, overrides };
}

/**
 * A colour picker hands back `#rrggbb`, but `overlay` and every `*-soft` are
 * `rgba(…)`. Setting the hex verbatim would silently drop the alpha and turn a
 * 14 % tint into a solid fill, so for those tokens the picked colour is
 * re-wrapped at the alpha the token already carries.
 */
function setOverride(token: TokenName, value: string): void {
  const previous = resolved.value[token];
  const alpha = /rgba\([^)]*,\s*([\d.]+)\s*\)/.exec(previous)?.[1];
  const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
  const next = alpha && isHex ? withAlpha(value.trim(), Number(alpha)) : value;
  spec.value = { ...spec.value, overrides: { ...spec.value.overrides, [token]: next } };
}

/** Hex/colour text fields commit only a parseable colour (or a full shadow). */
function commitToken(token: TokenName, event: Event): void {
  const input = event.target as HTMLInputElement;
  const value = input.value.trim();
  const valid = SHADOW_TOKENS[token] ? value.length > 0 : Boolean(parseHex(value)) || /^rgba?\(/.test(value);
  if (!valid) {
    input.value = resolved.value[token];
    return;
  }
  setOverride(token, value);
}

function resetOverrides(): void {
  spec.value = { ...spec.value, overrides: {} };
}

function loadShipped(id: string): void {
  const parsed = shipped.find((p) => p.id === id);
  if (!parsed) return;
  spec.value = specFromTokens(id, THEME_LABELS[id as keyof typeof THEME_LABELS] ?? id, parsed.tokens);
}

function startBlank(): void {
  spec.value = defaultSpec();
}

/**
 * The mode drives the derivation (ladder direction, shadow tint, color-scheme).
 * Switching it while the palette still belongs to the other polarity would emit
 * a "light" block with a black background, so the switch loads that mode's stock
 * palette (the shipped dark/light anchors) and keeps only the identity and any
 * explicit overrides. Status colours are part of the palette: light-bg themes
 * need darker ones, which is why swapping bg alone leaves unreadable tints.
 */
function setMode(light: boolean): void {
  const next = light ? "light" : "dark";
  if (modeFor(spec.value.anchors.bg) === next) {
    spec.value = { ...spec.value, mode: next };
    return;
  }
  const stock = shipped.find((p) => p.id === next);
  if (!stock) return;
  const seeded = specFromTokens(next, spec.value.label, stock.tokens);
  spec.value = {
    ...seeded,
    id: spec.value.id,
    label: spec.value.label,
    overrides: spec.value.overrides,
  };
}

async function copy(text: string, what: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = what;
    window.setTimeout(() => {
      if (copied.value === what) copied.value = null;
    }, 1600);
  } catch {
    copied.value = null;
  }
}

/** Writes the emitted block to `<id>.css` — the fixed/default file consumers import. */
function download(): void {
  const url = URL.createObjectURL(new Blob([`${block.value}\n`], { type: "text/css" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${spec.value.id || "my-theme"}.css`;
  link.click();
  URL.revokeObjectURL(url);
}

function share(): void {
  location.hash = `spec=${encodeSpec(spec.value)}`;
  localStorage.setItem("vuedemonde-builder", encodeSpec(spec.value));
  void copy(location.href, "link");
}

/**
 * Keep the URL in step with the draft once a link has been shared. Otherwise the
 * stale hash wins over localStorage on the next load and silently discards edits.
 */
function syncHash(): void {
  if (!location.hash.startsWith("#spec=")) return;
  history.replaceState(null, "", `#spec=${encodeSpec(spec.value)}`);
}

watch(
  spec,
  (value) => {
    localStorage.setItem("vuedemonde-builder", encodeSpec(value));
    syncHash();
  },
  { deep: true },
);

const shippedOptions = [{ value: "", label: "Start from…" }];
for (const id of THEME_IDS) shippedOptions.push({ value: id, label: THEME_LABELS[id] });
</script>

<template>
  <div class="build">
    <header class="build__bar">
      <div class="build__bar-row">
        <a class="build__back" href="./">← Catalogue</a>
        <h1 class="build__title">Theme builder</h1>
        <span class="build__sub">
          {{ Object.keys(spec.overrides).length }} override{{ Object.keys(spec.overrides).length === 1 ? "" : "s" }}
          · {{ THEME_TOKEN_ORDER.length }} tokens
        </span>
      </div>
      <div class="build__bar-row build__bar-row--end">
        <select class="build__native-select" aria-label="Load a shipped theme" @change="loadShipped(($event.target as HTMLSelectElement).value)">
          <option v-for="o in shippedOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <AppButton size="sm" variant="secondary" @click="startBlank">Blank</AppButton>
        <AppButton size="sm" variant="secondary" icon="copy" @click="share">
          {{ copied === "link" ? "Copied" : "Share link" }}
        </AppButton>
      </div>
    </header>

    <div class="build__body">
      <aside class="build__controls">
        <Fieldset legend="Identity">
          <div class="build__stack">
            <label class="build__field">
              <span>Id (used in the selector)</span>
              <input
                class="build__text"
                :value="spec.id"
                spellcheck="false"
                @input="renameTheme(($event.target as HTMLInputElement).value)"
              />
              <span v-if="idProblem" class="build__field-msg">{{ idProblem }}</span>
            </label>
            <label class="build__field">
              <span>Label</span>
              <input
                class="build__text"
                :value="spec.label"
                @input="spec = { ...spec, label: ($event.target as HTMLInputElement).value }"
              />
            </label>
            <label class="build__field build__field--inline">
              <span>Light theme</span>
              <AppToggle
                :model-value="spec.mode === 'light'"
                label="derive for a light background"
                @update:model-value="setMode($event)"
              />
            </label>
          </div>
        </Fieldset>

        <Fieldset v-for="group in ANCHOR_GROUPS" :key="group.legend" :legend="group.legend">
          <div class="build__tokens">
            <label v-for="key in group.keys" :key="key" class="build__token">
              <input
                class="build__swatch-input"
                type="color"
                :value="spec.anchors[key]"
                :aria-label="ANCHOR_LABELS[key]"
                @input="setAnchor(key, ($event.target as HTMLInputElement).value)"
              />
              <span class="build__token-name">{{ ANCHOR_LABELS[key] }}</span>
              <input
                class="build__hex"
                :value="spec.anchors[key]"
                spellcheck="false"
                @change="commitAnchor(key, $event)"
              />
            </label>
          </div>
        </Fieldset>

        <Fieldset legend="Derived tokens">
          <div class="build__stack">
            <label class="build__field build__field--inline">
              <span>Tint strength</span>
              <input
                class="build__range"
                type="range"
                min="0.08"
                max="0.24"
                step="0.01"
                :value="spec.softAlpha"
                @input="spec = { ...spec, softAlpha: Number(($event.target as HTMLInputElement).value) }"
              />
              <code>{{ spec.softAlpha.toFixed(2) }}</code>
            </label>
            <label class="build__field build__field--inline">
              <span>Shadow strength</span>
              <input
                class="build__range"
                type="range"
                min="0.4"
                max="1.6"
                step="0.05"
                :value="spec.shadowStrength"
                @input="spec = { ...spec, shadowStrength: Number(($event.target as HTMLInputElement).value) }"
              />
              <code>{{ spec.shadowStrength.toFixed(2) }}</code>
            </label>
            <div class="build__actions">
              <AppButton size="sm" variant="secondary" @click="showAll = !showAll">
                {{ showAll ? "Hide untouched" : "Show all 20" }}
              </AppButton>
              <AppButton size="sm" variant="ghost" :disabled="Object.keys(spec.overrides).length === 0" @click="resetOverrides">
                Reset overrides
              </AppButton>
            </div>
          </div>

          <Fieldset v-for="group in editable" :key="group.legend" :legend="group.legend" class="build__nested">
            <div class="build__tokens">
              <div v-for="token in group.tokens" :key="token" class="build__token">
                <button
                  class="build__lock"
                  type="button"
                  :class="{ 'is-on': isOverridden(token) }"
                  :aria-pressed="isOverridden(token)"
                  :aria-label="isOverridden(token) ? `Revert --${token} to its derived value` : `Pin an explicit value for --${token}`"
                  :title="isOverridden(token) ? 'Revert to derived value' : 'Pin an explicit value'"
                  @click="toggleOverride(token)"
                >
                  <span aria-hidden="true">{{ isOverridden(token) ? "◆" : "◇" }}</span>
                </button>
                <input
                  v-if="!SHADOW_TOKENS[token]"
                  class="build__swatch-input"
                  type="color"
                  :value="derivedHex(token)"
                  :aria-label="token"
                  @input="setOverride(token, ($event.target as HTMLInputElement).value)"
                />
                <span v-else class="build__swatch-spacer" aria-hidden="true" />
                <span class="build__token-name build__token-name--mono">--{{ token }}</span>
                <input
                  class="build__hex"
                  :class="{ 'build__hex--wide': SHADOW_TOKENS[token] }"
                  :value="resolved[token]"
                  spellcheck="false"
                  @change="commitToken(token, $event)"
                />
              </div>
            </div>
          </Fieldset>
        </Fieldset>
      </aside>

      <main class="build__main">
        <BuilderPreview :tokens="resolved" :mode="spec.mode" />

        <AppPanel title="Contrast" subtitle="Informational — the shipped themes sit inside this envelope too">
          <ul class="build__findings">
            <li v-if="findings.length === 0" class="build__finding build__finding--ok">
              No contrast concerns for this palette.
            </li>
            <li v-for="f in findings" :key="`${f.token}:${f.message}`" class="build__finding" :class="`is-${f.level}`">
              {{ f.message }}
            </li>
          </ul>
          <p class="build__hint">
            {{ errors.length }} error{{ errors.length === 1 ? "" : "s" }} · {{ warnings.length }} warning{{ warnings.length === 1 ? "" : "s" }}
          </p>
        </AppPanel>

        <AppPanel title="Export" subtitle="Selectable ships inside theme.css; fixed/default ship beside it">
          <Fieldset legend="Mode">
            <div class="build__modes">
              <label v-for="m in (['selectable', 'fixed', 'default'] as const)" :key="m" class="build__mode">
                <input
                  type="radio"
                  name="export-mode"
                  :value="m"
                  :checked="exportMode === m"
                  @change="exportMode = m"
                />
                <span>
                  <strong>{{ m }}</strong>
                  <em>
                    {{
                      m === "selectable"
                        ? '[data-theme="' + (spec.id || "id") + '"]'
                        : m === "fixed"
                          ? ":root — always wins"
                          : ":root:not([data-theme]) — default only"
                    }}
                  </em>
                </span>
              </label>
            </div>
          </Fieldset>

          <pre class="build__code">{{ block }}</pre>
          <div class="build__actions">
            <AppButton size="sm" icon="copy" @click="copy(block, 'css')">
              {{ copied === "css" ? "Copied" : "Copy CSS" }}
            </AppButton>
            <AppButton size="sm" variant="secondary" icon="document" @click="download">
              Download .css
            </AppButton>
            <AppButton size="sm" variant="secondary" icon="copy" @click="copy(usage, 'usage')">
              {{ copied === "usage" ? "Copied" : "Copy steps" }}
            </AppButton>
            <AppButton
              v-if="exportMode === 'selectable'"
              size="sm"
              variant="secondary"
              icon="copy"
              @click="copy(registration, 'registration')"
            >
              {{ copied === "registration" ? "Copied" : "Copy registration" }}
            </AppButton>
          </div>

          <AppMessage v-if="exportMode === 'selectable'" kind="warn">
            A selectable theme also needs its id in <code>src/theme.ts</code> and
            <code>test/theme-icons.test.ts</code>, plus the "16 themes" docs counts — use
            <em>Copy registration</em>.
          </AppMessage>

          <details class="build__details">
            <summary>{{ exportMode === "selectable" ? "Registration" : "Usage" }}</summary>
            <pre class="build__code">{{ exportMode === "selectable" ? registration : usage }}</pre>
          </details>
        </AppPanel>
      </main>
    </div>
  </div>
</template>

<style scoped>
.build {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font: 400 var(--fs-13)/1.45 var(--font-body);
}
.build__bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--line);
  background: var(--surface-1);
}
.build__bar-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  min-width: 0;
}
.build__bar-row--end {
  align-items: center;
}
.build__title {
  margin: 0;
  font: 600 var(--fs-16)/1.2 var(--font-body);
}
.build__back {
  color: var(--text-3);
  font-size: var(--fs-12);
  text-decoration: none;
  white-space: nowrap;
}
.build__back:hover {
  color: var(--text);
}
.build__sub {
  color: var(--text-3);
  font-size: var(--fs-12);
}
.build__native-select {
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 4px var(--space-2);
  font: 400 var(--fs-12)/1.4 var(--font-body);
}
.build__body {
  display: grid;
  grid-template-columns: minmax(320px, 400px) minmax(0, 1fr);
  gap: var(--space-4);
  padding: var(--space-4);
  align-items: start;
}
@media (max-width: 1100px) {
  .build__body {
    grid-template-columns: minmax(0, 1fr);
  }
}
.build__controls,
.build__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
}
.build__controls {
  position: sticky;
  top: 64px;
  max-height: calc(100vh - 80px);
  overflow: auto;
  padding-right: 2px;
}
@media (max-width: 1100px) {
  .build__controls {
    position: static;
    max-height: none;
    overflow: visible;
  }
}
.build__nested {
  margin-top: var(--space-2);
}
.build__stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.build__field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--fs-12);
  color: var(--text-2);
}
.build__field-msg {
  color: var(--warn);
  font-size: 11px;
}
.build__field--inline {
  flex-direction: row;
  align-items: center;
  gap: var(--space-2);
}
.build__text {
  width: 100%;
  box-sizing: border-box;
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 4px var(--space-2);
  font: 400 var(--fs-12)/1.4 var(--font-mono);
}
.build__text:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}
.build__range {
  flex: 1;
  accent-color: var(--accent);
}
.build__tokens {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.build__token {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) 84px;
  align-items: center;
  gap: var(--space-2);
}
.build__token-name {
  font-size: var(--fs-12);
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.build__token-name--mono {
  font-family: var(--font-mono);
  font-size: var(--fs-11, 11px);
}
.build__swatch-input {
  width: 26px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: none;
  cursor: pointer;
}
.build__swatch-spacer {
  width: 26px;
}
.build__hex--wide {
  width: 132px;
}
.build__hex {
  width: 100%;
  box-sizing: border-box;
  background: var(--surface-2);
  color: var(--text-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  font: 400 11px/1.4 var(--font-mono);
}
.build__hex:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring);
  outline-offset: 1px;
}
.build__lock {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--text-3);
  cursor: pointer;
  font-size: 10px;
  line-height: 1;
}
.build__lock.is-on {
  color: var(--accent);
  border-color: var(--accent);
}
.build__lock:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring);
  outline-offset: 1px;
}
.build__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
.build__code {
  margin: var(--space-2) 0 0;
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--canvas-bg);
  color: var(--text-2);
  font: 400 var(--fs-12)/1.5 var(--font-mono);
  overflow: auto;
  max-height: 340px;
  tab-size: 2;
}
.build__findings {
  margin: 0;
  padding-left: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.build__finding {
  font-size: var(--fs-12);
}
.build__finding.is-error {
  color: var(--err);
}
.build__finding.is-warn {
  color: var(--warn);
}
.build__finding--ok {
  color: var(--ok);
  list-style: none;
  padding-left: 0;
}
.build__hint {
  margin: var(--space-2) 0 0;
  color: var(--text-3);
  font-size: var(--fs-12);
}
.build__modes {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.build__mode {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  cursor: pointer;
}
.build__mode input {
  margin-top: 3px;
  accent-color: var(--accent);
}
.build__mode span {
  display: flex;
  flex-direction: column;
}
.build__mode em {
  color: var(--text-3);
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 11px;
}
.build__details {
  margin-top: var(--space-3);
}
.build__details summary {
  cursor: pointer;
  color: var(--text-2);
  font-size: var(--fs-12);
}
</style>
