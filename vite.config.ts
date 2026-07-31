import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  base: './',
  tanstackStart: {
    app: {
      target: "spa"
    },
    prerender: {
      routes: ['/']
    }
  }
});
