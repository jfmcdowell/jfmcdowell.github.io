// astro.config.ts
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://jfmcdowell.github.io",
  output: "static",
  compressHTML: true,
  build: {
    format: "directory",
  },
  vite: {
    build: {
      rollupOptions: {
        external: ["/pagefind/pagefind-ui.js"],
      },
    },
  },
});
