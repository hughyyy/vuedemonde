import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("./src", import.meta.url));

/**
 * Opt-in quality audit suite (run on demand, NOT part of `npm test`):
 *   npm run test:audit
 * Mounts every playground family section in print mode under the three
 * catalogue themes plus the theme banner under all 16 themes, and fails on
 * any console error/warning — the repeatable zero-rendering-error net for the
 * 0.2.1 quality phase (see docs/quality-audit.md).
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@vuedemonde": src,
    },
  },
  test: {
    environment: "happy-dom",
    include: ["audit/**/*.test.ts"],
    setupFiles: ["audit/setup.ts"],
  },
});
