import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/attendance/',   // <<< ADD THIS LINE
  server: {
    port: 3000,
  },
});