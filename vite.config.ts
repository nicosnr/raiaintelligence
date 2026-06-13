import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Pass Vite-specific options under the `vite` key so the wrapper merges them.
  vite: {
    build: {
      outDir: "dist",
      emptyOutDir: true
    }
  },
  tanstackStart: {
    app: {
      target: "spa"
    },
    prerender: {
      routes: ['/']
    }
  }
});
