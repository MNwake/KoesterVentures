import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig({
  root: "webserver/websites/KoesterVentures",
  plugins: [svelte()],
  build: {
    outDir: "public",
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        app: path.resolve(__dirname, "src/js/app.js"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: "src",
  server: {
    port: 3003,
  },
});
