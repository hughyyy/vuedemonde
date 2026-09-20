import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("./src", import.meta.url));

/** Playground (the lightweight interface) — dev server + static demo build. */
export default defineConfig({
  root: "playground",
  plugins: [vue()],
  resolve: {
    alias: {
      "@vuedemond": src,
    },
  },
  server: { port: 5199 },
  build: { outDir: "../dist-demo", emptyOutDir: true },
});
