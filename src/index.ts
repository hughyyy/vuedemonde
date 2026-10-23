/**
 * Vue de monde — a lightweight Vue 3 component + design-token library, extracted
 * and made standalone from the Nexus visual-editor app's custom UI kit.
 *
 * Consumption model:
 *   import { AppButton, DataTable, ... } from "vuedemonde";
 *   import "vuedemonde/theme.css";   // design tokens + 24 themes (required)
 *   import "vuedemonde/kit.css";     // small optional global helpers
 *
 * The components ship pre-scoped and token-driven — they have zero styling on
 * their own beyond `var(--…)` reads from `theme.css`, so theming is a single
 * `data-theme` attribute on `<html>` and optionally an `applyAccent()` override.
 */
export * from "./kit";
export * from "./charts";
export * from "./calendar";
export * from "./board";
export * from "./theme";
export * from "./accent";
