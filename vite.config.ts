import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    app: {
      target: "spa"
    },
    prerender: {
      routes: ['/']
    }
  },
  // Targets Vercel's SSR/Functions runtime so server routes (e.g. the AI
  // assistant's /api/assistant handler) keep running per-request instead of
  // being served as static files. netlify.toml is kept in the repo for a
  // future Netlify deploy, but only one Nitro preset can be active at a
  // time — switch this back to "netlify" if deploying there instead.
  nitro: {
    preset: "vercel"
  }
});
