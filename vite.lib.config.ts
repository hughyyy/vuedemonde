import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

/** Library build → dist/*.js + dist/*.css + verbatim theme.css/kit.css. */
export default defineConfig({
  plugins: [
    vue(),
    {
      name: "vuedemonde-copy-css",
      closeBundle() {
        mkdirSync("dist", { recursive: true });
        for (const css of ["theme.css", "kit.css"]) {
          copyFileSync(resolve("src", css), resolve("dist", css));
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Vuedemonde",
      fileName: "vuedemonde",
      formats: ["es"],
      cssFileName: "vuedemonde",
    },
    rollupOptions: {
      external: ["vue"],
    },
  },
});
