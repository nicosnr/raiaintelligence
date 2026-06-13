import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    app: {
      target: "spa"
    },
    prerender: {
      routes: ['/']
    }
  }
});
