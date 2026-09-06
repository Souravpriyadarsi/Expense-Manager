import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Relative base so the production build works when served from any
// sub-path on a local host (e.g. http://localhost:4173/expense-manager/).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    open: true,
  },
});
