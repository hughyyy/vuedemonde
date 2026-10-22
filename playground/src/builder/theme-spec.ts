/**
 * Theme-builder core — parse, derive, emit and validate `[data-theme]` blocks.
 *
 * Pure (no DOM, no Vue): the builder page, the unit tests and any future CLI all
 * share this module. `src/theme.css` is the contract — the shipped blocks define
 * the token list, their order, the ladder proportions and the derived-value
 * conventions this module reproduces.
 *
 * Model: 13 anchor colours are authored; 21 tokens are derived from them
 * (`surface-2/3`, the text ladder, lines, `accent-*` states, `*-soft` tints,
 * shadows). Any derived token can be overridden explicitly — that is how the
 * shipped themes were hand-tuned (`accent-ink` in all 16, `accent-strong` in
 * every one).
 */

import { contrastRatio, luminance, parseHex, withAlpha } from "@vuedemonde";

/** Token order of every shipped theme block (34 tokens). */
export const THEME_TOKEN_ORDER = [
  "bg",
  "surface-1",
  "surface-2",
  "surface-3",
  "canvas-bg",
  "overlay",
  "text",
  "text-2",
  "text-3",
  "text-disabled",
  "line",
  "line-strong",
  "divider",
  "accent",
  "accent-2",
  "accent-gradient",
  "accent-strong",
  "accent-soft",
  "accent-ink",
  "ok",
  "ok-soft",
  "warn",
  "warn-soft",
  "err",
  "err-soft",
  "run",
  "run-soft",
  "info",
  "info-soft",
  "link",
  "reasoning",
  "shadow-raised",
  "shadow-overlay",
  "shadow-modal",
] as const;

export type TokenName = (typeof THEME_TOKEN_ORDER)[number];

/** The authored colours. Everything else follows from these. */
export const ANCHORS = [
  "bg",
  "surface-1",
  "canvas-bg",
  "text",
  "accent",
  "accent-2",
  "ok",
  "warn",
  "err",
  "run",
  "info",
  "link",
  "reasoning",
] as const;

/** Anchor grouping for the editor — data, so coverage stays testable. */
export const ANCHOR_GROUPS: { legend: string; keys: AnchorName[] }[] = [
  { legend: "Surfaces", keys: ["bg", "surface-1", "canvas-bg"] },
  { legend: "Text", keys: ["text"] },
  { legend: "Accent", keys: ["accent", "accent-2"] },
  { legend: "Status", keys: ["ok", "warn", "err", "run", "info"] },
  { legend: "Other", keys: ["link", "reasoning"] },
];

/**
 * Derived tokens, grouped the way the stylesheet is grouped. `accent-gradient`
 * is deliberately absent: it is structural, always emitted as a `var()`
 * reference, and has no editable value.
 */
export const DERIVED_GROUPS: { legend: string; tokens: TokenName[] }[] = [
  { legend: "Surfaces", tokens: ["surface-2", "surface-3", "overlay"] },
  { legend: "Text", tokens: ["text-2", "text-3", "text-disabled"] },
  { legend: "Lines", tokens: ["line", "line-strong", "divider"] },
  { legend: "Accent states", tokens: ["accent-strong", "accent-soft", "accent-ink"] },
  { legend: "Status tints", tokens: ["ok-soft", "warn-soft", "err-soft", "run-soft", "info-soft"] },
  { legend: "Elevation", tokens: ["shadow-raised", "shadow-overlay", "shadow-modal"] },
];

export type AnchorName = (typeof ANCHORS)[number];
export type ThemeMode = "dark" | "light";
/** selectable → `[data-theme]`; fixed → `:root`; default → `:root:not([data-theme])`. */
export type ExportMode = "selectable" | "fixed" | "default";

export type ThemeSpec = {
  id: string;
  label: string;
  mode: ThemeMode;
  anchors: Record<AnchorName, string>;
  /** Alpha for every `*-soft` tint (0.10–0.22). */
  softAlpha: number;
  /** Multiplier on the three shadow alphas (0.5 = quieter, 1.5 = heavier). */
  shadowStrength: number;
  /** Explicit values for derived tokens, overriding the derivation. */
  overrides: Partial<Record<TokenName, string>>;
};

export type ResolvedTheme = Record<TokenName, string>;

/* ---------------------------------------------------------------------------
 * Colour helpers
 * ------------------------------------------------------------------------ */

type Rgb = { r: number; g: number; b: number };
const clamp255 = (n: number): number => Math.max(0, Math.min(255, Math.round(n)));

function toHex({ r, g, b }: Rgb): string {
  const part = (n: number): string => clamp255(n).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** Linear mix: `t=0` → a, `t=1` → b. */
export function mix(a: string, b: string, t: number): string {
  const from = parseHex(a);
  const to = parseHex(b);
  if (!from || !to) return a;
  return toHex({
    r: from.r + (to.r - from.r) * t,
    g: from.g + (to.g - from.g) * t,
    b: from.b + (to.b - from.b) * t,
  });
}

/** Composite `fg` at `alpha` over `bg`, so a tint can be contrast-checked. */
export function blend(fg: string, alpha: number, bg: string): string {
  const f = parseHex(fg);
  const b = parseHex(bg);
  if (!f || !b) return fg;
  return toHex({
    r: f.r * alpha + b.r * (1 - alpha),
    g: f.g * alpha + b.g * (1 - alpha),
    b: f.b * alpha + b.b * (1 - alpha),
  });
}

/* ---------------------------------------------------------------------------
 * Derivation. Proportions are fitted from the 16 shipped blocks: surfaces and
 * text are mixes of bg→text (or bg→white for a raised light surface-1), lines
 * sit at the low end of the same axis, shadows carry the mode's tint.
 * ------------------------------------------------------------------------ */

/**
 * Fitted proportions. Surfaces/lines/text are mixes on the bg→text axis (a
 * light theme's surface-1 is authored lighter than its bg, so it stays an
 * anchor); `overlay` is bg darkened and carried at an alpha; shadows use a
 * tint that is pure black in dark mode and a darkened bg in light mode.
 */
type Ladder = {
  s2: number;
  s3: number;
  line: number;
  lineStrong: number;
  divider: number;
  text2: number;
  text3: number;
  disabled: number;
  /** [mix factor bg→black, alpha] */
  overlay: [number, number];
  /** [hover target, mix amount] for --accent-strong */
  strong: [string, number];
  /** mix factor bg→black for the shadow tint */
  shadowTint: number;
  shadows: [number, number, number];
};

const LADDERS: Record<ThemeMode, Ladder> = {
  dark: {
    s2: 0.084,
    s3: 0.127,
    line: 0.15,
    lineStrong: 0.22,
    divider: 0.1,
    text2: 0.78,
    text3: 0.55,
    disabled: 0.34,
    overlay: [0.75, 0.55],
    strong: ["#ffffff", 0.18],
    shadowTint: 1,
    shadows: [0.35, 0.5, 0.6],
  },
  light: {
    s2: 0.043,
    s3: 0.091,
    line: 0.155,
    lineStrong: 0.247,
    divider: 0.078,
    text2: 0.783,
    text3: 0.635,
    disabled: 0.397,
    overlay: [0.9, 0.4],
    strong: ["#000000", 0.2],
    shadowTint: 0.9,
    shadows: [0.12, 0.18, 0.24],
  },
};

/**
 * Text on an accent fill. The shipped themes use near-white, or a very dark
 * tint of the accent itself — so the dark candidate is derived from the accent
 * rather than pinned to a fixed hex. Dark ink is preferred whenever it clears
 * AA, which is what the hand-authored blocks do.
 */
function accentInk(accent: string): string {
  const dark = mix(accent, "#000000", 0.88);
  const white = "#ffffff";
  if (contrastRatio(dark, accent) >= 4.5) return dark;
  if (contrastRatio(white, accent) >= 4.5) return white;
  return contrastRatio(dark, accent) >= contrastRatio(white, accent) ? dark : white;
}

export function modeFor(bg: string): ThemeMode {
  return luminance(bg) >= 0.35 ? "light" : "dark";
}

/** The derived (unoverridden) value of every token. */
export function deriveTheme(spec: ThemeSpec): ResolvedTheme {
  const a = spec.anchors;
  const l = LADDERS[spec.mode];
  const tint = (hex: string): string => withAlpha(hex, spec.softAlpha);
  const shadowTint = mix(a.bg, "#000000", l.shadowTint);
  const shadow = (base: number, spread: string): string =>
    `0 ${spread} ${withAlpha(shadowTint, Math.min(1, Math.max(0, base * spec.shadowStrength)))}`;
  const ink = accentInk(a.accent);

  return {
    bg: a.bg,
    "surface-1": a["surface-1"],
    "surface-2": mix(a.bg, a.text, l.s2),
    "surface-3": mix(a.bg, a.text, l.s3),
    "canvas-bg": a["canvas-bg"],
    overlay: withAlpha(mix(a.bg, "#000000", l.overlay[0]), l.overlay[1]),

    text: a.text,
    "text-2": mix(a.bg, a.text, l.text2),
    "text-3": mix(a.bg, a.text, l.text3),
    "text-disabled": mix(a.bg, a.text, l.disabled),

    line: mix(a.bg, a.text, l.line),
    "line-strong": mix(a.bg, a.text, l.lineStrong),
    divider: mix(a.bg, a.text, l.divider),

    accent: a.accent,
    "accent-2": a["accent-2"],
    "accent-gradient": "linear-gradient(var(--accent), var(--accent-2))",
    "accent-strong": mix(a.accent, l.strong[0], l.strong[1]),
    "accent-soft": tint(a.accent),
    "accent-ink": ink,

    ok: a.ok,
    "ok-soft": tint(a.ok),
    warn: a.warn,
    "warn-soft": tint(a.warn),
    err: a.err,
    "err-soft": tint(a.err),
    run: a.run,
    "run-soft": tint(a.run),
    info: a.info,
    "info-soft": tint(a.info),
    link: a.link,
    reasoning: a.reasoning,

    "shadow-raised": shadow(l.shadows[0], "1px 2px"),
    "shadow-overlay": shadow(l.shadows[1], "6px 24px"),
    "shadow-modal": shadow(l.shadows[2], "12px 48px"),
  };
}

/** Derivation + explicit overrides — the values that will be emitted. */
export function resolveTheme(spec: ThemeSpec): ResolvedTheme {
  const derived = deriveTheme(spec);
  const out = {} as ResolvedTheme;
  for (const token of THEME_TOKEN_ORDER) {
    // `accent-gradient` is structural — it must stay a var() reference so a
    // runtime accent override (applyAccent) keeps flowing through it.
    const override = token === "accent-gradient" ? undefined : spec.overrides[token];
    out[token] = override ?? derived[token];
  }
  return out;
}

/* ---------------------------------------------------------------------------
 * Parsing. Reads whatever `theme.css` shape is out there: `:root` (the dark
 * block — it also carries non-theme tokens, which are ignored) and every
 * `[data-theme="…"]` block.
 * ------------------------------------------------------------------------ */

export type ParsedTheme = { id: string; tokens: Partial<ResolvedTheme> };

const BLOCK_RE = /(?::root|\[data-theme="([^"]+)"\])\s*\{([^}]*)\}/g;
const TOKEN_RE = /--([a-z0-9-]+)\s*:\s*([^;]+);/g;

/**
 * Split a stylesheet into theme blocks. `:root` appears more than once in
 * `theme.css` (the token map, and the reduced-motion override), so a root block
 * only counts as the dark theme when it actually defines `--bg` — and the first
 * such block wins.
 */
export function parseThemeCss(css: string): ParsedTheme[] {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: ParsedTheme[] = [];
  const seen = new Set<string>();
  for (const block of stripped.matchAll(BLOCK_RE)) {
    const id = block[1] ?? "dark";
    if (seen.has(id)) continue;
    const tokens: Partial<ResolvedTheme> = {};
    for (const tok of block[2]!.matchAll(TOKEN_RE)) {
      const name = tok[1]!;
      if ((THEME_TOKEN_ORDER as readonly string[]).includes(name)) {
        tokens[name as TokenName] = tok[2]!.trim();
      }
    }
    if (Object.keys(tokens).length === 0) continue;
    seen.add(id);
    out.push({ id, tokens });
  }
  return out;
}

/** Build a spec from a parsed block: anchors authored, everything else pinned. */
export function specFromTokens(id: string, label: string, tokens: Partial<ResolvedTheme>): ThemeSpec {
  const read = (name: AnchorName, fallback: string): string => tokens[name] ?? fallback;
  const bg = read("bg", "#101418");
  const spec: ThemeSpec = {
    id,
    label,
    mode: modeFor(bg),
    anchors: {
      bg,
      "surface-1": read("surface-1", bg),
      "canvas-bg": read("canvas-bg", bg),
      text: read("text", "#d7dde4"),
      accent: read("accent", "#4f9cf9"),
      "accent-2": read("accent-2", tokens.accent ?? "#4f9cf9"),
      ok: read("ok", "#3ecf6e"),
      warn: read("warn", "#f0a33c"),
      err: read("err", "#f25d5d"),
      run: read("run", "#e0b64f"),
      info: read("info", "#4fc3f7"),
      link: read("link", "#2980b9"),
      reasoning: read("reasoning", "#e8a05c"),
    },
    softAlpha: 0.14,
    shadowStrength: 1,
    overrides: {},
  };
  const derived = deriveTheme(spec);
  for (const token of THEME_TOKEN_ORDER) {
    const value = tokens[token];
    if (value !== undefined && value !== derived[token]) spec.overrides[token] = value;
  }
  return spec;
}

/* ---------------------------------------------------------------------------
 * Emission
 * ------------------------------------------------------------------------ */

const GROUPS: readonly (readonly TokenName[])[] = [
  ["bg", "surface-1", "surface-2", "surface-3", "canvas-bg", "overlay"],
  ["text", "text-2", "text-3", "text-disabled"],
  ["line", "line-strong", "divider"],
  ["accent", "accent-2", "accent-gradient", "accent-strong", "accent-soft", "accent-ink"],
  ["ok", "ok-soft", "warn", "warn-soft", "err", "err-soft", "run", "run-soft", "info", "info-soft", "link", "reasoning"],
  ["shadow-raised", "shadow-overlay", "shadow-modal"],
];

export function themeSelector(spec: ThemeSpec, mode: ExportMode): string {
  if (mode === "fixed") return ":root";
  if (mode === "default") return ":root:not([data-theme])";
  return `[data-theme="${spec.id}"]`;
}

/** The block, formatted like the shipped ones (grouped, blank-line separated). */
export function emitThemeBlock(spec: ThemeSpec, mode: ExportMode): string {
  const v = resolveTheme(spec);
  const lines: string[] = [];
  lines.push(`${themeSelector(spec, mode)} {`);
  lines.push(`  color-scheme: ${spec.mode};`);
  for (const group of GROUPS) {
    lines.push("");
    for (const token of group) lines.push(`  --${token}: ${v[token]};`);
  }
  lines.push("}");
  return lines.join("\n");
}

/**
 * Registration for a selectable theme. `THEME_IDS` order must match the blocks
 * in `theme.css` (the parity test derives the expected list from the file); the
 * banner's rows are curated, and its audit count fails until the new id is
 * placed there.
 */
export function emitRegistration(spec: ThemeSpec): string {
  const id = spec.id;
  return [
    "// 1. src/theme.css — append the block after the last [data-theme] block.",
    "// 2. src/theme.ts — THEME_IDS (keep the stylesheet's order):",
    `  "${id}",`,
    "// 3. src/theme.ts — THEME_LABELS:",
    `  "${id}": "${spec.label}",`,
    '// 4. Docs: add the id to the README theme list and update the "16 themes"',
    "//    counts (README ×2, docs/release-rendering.md, docs/quality-audit.md).",
    "// 5. playground/src/BannerPrint.vue — place the id in the curated rows",
    "//    (dark themes first, lights last), then: npm run render:release banner",
  ].join("\n");
}

/** Guidance for the fixed/default modes, where import order is the contract. */
export function emitUsage(mode: ExportMode, file = "my-theme.css"): string {
  if (mode === "selectable") {
    return [
      "1. Paste the block into src/theme.css (after the last [data-theme] block).",
      "2. Add the id to THEME_IDS and its label to THEME_LABELS in src/theme.ts.",
      '3. Select it with document.documentElement.dataset.theme = "<id>".',
    ].join("\n");
  }
  const shared = [
    `1. Save as ${file} and import it AFTER "vuedemonde/theme.css".`,
    `2. Do not paste it into theme.css — it would silently become every consumer's default.`,
  ];
  if (mode === "fixed") {
    return [
      ...shared,
      "3. The :root block wins over every [data-theme] block, so the app is locked",
      "   to this palette even when data-theme is set.",
    ].join("\n");
  }
  return [
    ...shared,
    "3. Leave <html> without data-theme: the block applies while nothing is",
    "   selected, and any data-theme value still overrides it.",
  ].join("\n");
}

/* ---------------------------------------------------------------------------
 * Validation. Thresholds are calibrated against the shipped 16 (whose own worst
 * cases are text-3 3.27, link 3.06, accent 2.42, ink 2.60): a generated theme is
 * flagged when it is worse than the library's own envelope.
 * ------------------------------------------------------------------------ */

export type Finding = {
  level: "error" | "warn";
  token: TokenName | "ladder";
  message: string;
  ratio?: number;
};

export function validateTheme(spec: ThemeSpec): Finding[] {
  const v = resolveTheme(spec);
  const out: Finding[] = [];

  const check = (token: TokenName, against: string, min: number, errorAt: number, what: string): void => {
    const ratio = contrastRatio(v[token], against);
    if (ratio < errorAt) {
      out.push({ level: "error", token, message: `${what} — ${ratio.toFixed(2)}:1`, ratio });
    } else if (ratio < min) {
      out.push({ level: "warn", token, message: `${what} — ${ratio.toFixed(2)}:1`, ratio });
    }
  };

  check("text", v.bg, 7, 4.5, "Body text on background");
  check("text-2", v.bg, 4.5, 3.5, "Secondary text on background");
  check("text-3", v.bg, 3, 2.4, "Tertiary text on background");
  check("link", v.bg, 3.5, 2.4, "Link on background");
  check("accent", v.bg, 3, 2.4, "Accent on background");
  check("accent-ink", v.accent, 4.5, 2.4, "Text on accent fill");

  // Every threshold below sits inside the shipped envelope: the 16 blocks
  // themselves reach ok/run 2.36, warn 2.51, text-3 3.27, link 3.06, accent
  // 2.42 — so a generated theme is only *errored* when it is worse than the
  // library already is, and *warned* when it is in the shipped worst quartile.
  for (const token of ["ok", "warn", "err", "run", "info"] as const) {
    const soft = v[`${token}-soft` as TokenName];
    const alpha = Number(/rgba\([^)]*,\s*([\d.]+)\s*\)/.exec(soft)?.[1] ?? 0.14);
    const tinted = blend(v[token], alpha, v.bg);
    const ratio = contrastRatio(v[token], tinted);
    if (ratio < 2.2) out.push({ level: "error", token, message: `${token} on its own tint — ${ratio.toFixed(2)}:1`, ratio });
    else if (ratio < 3) out.push({ level: "warn", token, message: `${token} on its own tint — ${ratio.toFixed(2)}:1`, ratio });
  }

  // Every step in the surface ladder must stay visible. Light themes put
  // surface-1 above bg and then step down again, so this checks separation
  // between consecutive steps rather than a single monotonic direction — the
  // shipped blocks' closest step is 1.05:1, a collapsed one is 1.00:1.
  const surfaceOrder = ["bg", "surface-1", "surface-2", "surface-3"] as const;
  for (let i = 1; i < surfaceOrder.length; i++) {
    const separation = contrastRatio(v[surfaceOrder[i]!], v[surfaceOrder[i - 1]!]);
    if (separation >= 1.02) continue;
    out.push({
      level: "error",
      token: "ladder",
      message: `${surfaceOrder[i]} is indistinguishable from ${surfaceOrder[i - 1]} — cards will merge into the background`,
      ratio: separation,
    });
    break;
  }
  // The ladder must stay ordered: text-3 carries more contrast than
  // text-disabled, which means *brighter* on a dark theme and *darker* on a
  // light one.
  const contrastSteps = [v["text-2"], v["text-3"], v["text-disabled"]].map((c) => contrastRatio(c, v.bg));
  if (!(contrastSteps[0]! > contrastSteps[1]! && contrastSteps[1]! > contrastSteps[2]!)) {
    out.push({ level: "warn", token: "text-3", message: "text ladder is out of order — text-2 / text-3 / disabled should lose contrast in that order" });
  }
  const declared = modeFor(v.bg);
  if (declared !== spec.mode) {
    out.push({
      level: "warn",
      token: "bg",
      message: `background is ${declared} but the theme declares ${spec.mode} — ladders and shadows derive for the wrong polarity`,
    });
  }
  return out;
}

/* ---------------------------------------------------------------------------
 * Shareable state
 * ------------------------------------------------------------------------ */

export function encodeSpec(spec: ThemeSpec): string {
  const json = JSON.stringify(spec);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeSpec(raw: string): ThemeSpec | null {
  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const value = JSON.parse(new TextDecoder().decode(bytes)) as ThemeSpec;
    if (!value || typeof value.id !== "string" || !value.anchors) return null;
    return value;
  } catch {
    return null;
  }
}

/** A blank starting point: the shipped dark palette's anchors, derived values. */
export function defaultSpec(): ThemeSpec {
  return {
    id: "my-theme",
    label: "My Theme",
    mode: "dark",
    anchors: {
      bg: "#101418",
      "surface-1": "#171c22",
      "canvas-bg": "#0c0f14",
      text: "#d7dde4",
      accent: "#4f9cf9",
      "accent-2": "#4f9cf9",
      ok: "#3ecf6e",
      warn: "#f0a33c",
      err: "#f25d5d",
      run: "#e0b64f",
      info: "#4fc3f7",
      link: "#2980b9",
      reasoning: "#e8a05c",
    },
    softAlpha: 0.14,
    shadowStrength: 1,
    overrides: {},
  };
}
