import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";
import { VitePWA }      from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType:  "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png"],
      manifest: {
  name:             "Expense Tracker",
  short_name:       "Expense Tracker",
  description:      "AI-powered expense tracker",
  id:               "/",
  start_url:        "/",
  display:          "standalone",
  orientation:      "portrait",
  background_color: "#0f172a",
  theme_color:      "#6366f1",
  icons: [
    {
      src:     "icons/icon-192.png",
      sizes:   "192x192",
      type:    "image/png",
      purpose: "any",
    },
    {
      src:     "icons/icon-192.png",
      sizes:   "192x192",
      type:    "image/png",
      purpose: "maskable",
    },
    {
      src:     "icons/icon-512.png",
      sizes:   "512x512",
      type:    "image/png",
      purpose: "any",
    },
    {
      src:     "icons/icon-512.png",
      sizes:   "512x512",
      type:    "image/png",
      purpose: "maskable",
    },
  ],
},
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
});