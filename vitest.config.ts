import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [vue()],
  // Same alias the playground builds with — tests import playground modules
  // (e.g. the theme builder core) that consume the library by package name.
  resolve: {
    alias: {
      "@vuedemonde": src,
    },
  },
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.ts"],
  },
});
