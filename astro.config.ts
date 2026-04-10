// astro.config.ts
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://jfmcdowell.github.io",
  output: "static",
  compressHTML: true,
  build: {
    format: "directory",
  },
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  vite: {
    build: {
      rollupOptions: {
        external: ["/pagefind/pagefind-ui.js"],
      },
    },
  },
});
