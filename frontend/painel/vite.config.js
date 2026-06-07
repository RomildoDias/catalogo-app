import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const target = process.env.API_URL || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/auth": target,
      "/produtos": target,
      "/categorias": target,
      "/admin": target,
      "/health": target,
      "/loja": target,
      "/catalogo": target,
      "/uploads": target,
    },
  },
});
